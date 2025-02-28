import { NextResponse } from "next/server"
import { stripe } from "@/app/lib/stripe"
import { updateUserCredits, getUserCredits } from "@/app/lib/supabase"
import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  let event

  try {
    console.log("🔍 [WEBHOOK] Received Stripe webhook")

    // Verify webhook signature and extract event
    if (endpointSecret) {
      // If we have a webhook secret, verify the signature
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } else {
      // For development without a webhook secret, parse the event directly
      // This is less secure but allows for testing without signature
      console.log(
        "⚠️ [WEBHOOK] No webhook secret found, accepting without verification"
      )
      event = JSON.parse(body)
    }

    console.log(`✅ [WEBHOOK] Event type: ${event.type}`)

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      // Extract userId and creditAmount from session metadata
      const { userId, creditAmount } = session.metadata

      if (!userId || !creditAmount) {
        console.error(
          "❌ [WEBHOOK] Missing userId or creditAmount in session metadata"
        )
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
      }

      console.log(
        `🔍 [WEBHOOK] Processing payment for user ${userId} with ${creditAmount} credits`
      )

      // Create a Supabase client with the service role key for admin access
      // This bypasses RLS policies and lets us update the credits table
      let supabaseAdmin
      try {
        if (supabaseServiceKey) {
          supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              persistSession: false,
            },
          })
          console.log("✅ [WEBHOOK] Created admin Supabase client")
        } else {
          console.log(
            "⚠️ [WEBHOOK] No service role key found, using standard client"
          )
          // Fall back to the regular client
        }
      } catch (e) {
        console.error("❌ [WEBHOOK] Error creating admin client:", e)
      }

      // Get current user credits
      let currentCredits = 0
      try {
        // Try with admin client first
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from("credits")
            .select("amount")
            .eq("user_id", userId)
            .single()

          if (error) {
            console.error(
              "❌ [WEBHOOK] Admin client error getting credits:",
              error
            )
          } else if (data) {
            currentCredits = data.amount
            console.log(`✅ [WEBHOOK] Current credits: ${currentCredits}`)
          } else {
            console.log("⚠️ [WEBHOOK] No credits record found, will create one")
          }
        } else {
          // Fall back to the regular method
          const { credits, error } = await getUserCredits(userId)
          if (error) {
            console.error("❌ [WEBHOOK] Error getting current credits:", error)
          } else {
            currentCredits = credits
            console.log(
              `✅ [WEBHOOK] Current credits (fallback): ${currentCredits}`
            )
          }
        }
      } catch (e) {
        console.error("❌ [WEBHOOK] Exception getting credits:", e)
      }

      // Calculate new credit amount by adding purchased credits to existing balance
      const newCreditBalance = currentCredits + parseInt(creditAmount, 10)
      console.log(
        `🔍 [WEBHOOK] New credit balance will be: ${newCreditBalance}`
      )

      // Update user's credits in database
      let success = false
      let updateError = null

      try {
        if (supabaseAdmin) {
          // Check if the user has a credits record
          const { data: existingRecord, error: checkError } =
            await supabaseAdmin
              .from("credits")
              .select("id")
              .eq("user_id", userId)
              .single()

          if (checkError && !checkError.message.includes("No rows found")) {
            console.error(
              "❌ [WEBHOOK] Error checking for existing record:",
              checkError
            )
            updateError = checkError
          } else if (existingRecord) {
            // Update existing record
            const { error } = await supabaseAdmin
              .from("credits")
              .update({
                amount: newCreditBalance,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId)

            if (error) {
              console.error("❌ [WEBHOOK] Error updating credits:", error)
              updateError = error
            } else {
              success = true
              console.log(
                `✅ [WEBHOOK] Credits updated successfully to ${newCreditBalance}`
              )

              // Add transaction record
              const { error: txError } = await supabaseAdmin
                .from("transactions")
                .insert({
                  user_id: userId,
                  amount: parseInt(creditAmount, 10),
                  type: "purchase",
                  status: "completed",
                  metadata: {
                    stripe_session_id: session.id,
                    package_id: session.metadata.packageId,
                    previous_balance: currentCredits,
                    new_balance: newCreditBalance,
                  },
                  created_at: new Date().toISOString(),
                })

              if (txError) {
                console.log(
                  "⚠️ [WEBHOOK] Error recording transaction (non-critical):",
                  txError
                )
              }
            }
          } else {
            // Create new record
            const { error } = await supabaseAdmin.from("credits").insert({
              user_id: userId,
              amount: newCreditBalance,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (error) {
              console.error(
                "❌ [WEBHOOK] Error inserting new credits record:",
                error
              )
              updateError = error
            } else {
              success = true
              console.log(
                `✅ [WEBHOOK] New credits record created with ${newCreditBalance} credits`
              )

              // Add transaction record
              const { error: txError } = await supabaseAdmin
                .from("transactions")
                .insert({
                  user_id: userId,
                  amount: parseInt(creditAmount, 10),
                  type: "purchase",
                  status: "completed",
                  metadata: {
                    stripe_session_id: session.id,
                    package_id: session.metadata.packageId,
                    previous_balance: 0,
                    new_balance: newCreditBalance,
                  },
                  created_at: new Date().toISOString(),
                })

              if (txError) {
                console.log(
                  "⚠️ [WEBHOOK] Error recording transaction (non-critical):",
                  txError
                )
              }
            }
          }
        } else {
          // Fall back to the regular method
          const result = await updateUserCredits(userId, newCreditBalance)
          success = result.success
          updateError = result.error
        }
      } catch (e) {
        console.error("❌ [WEBHOOK] Exception updating credits:", e)
        updateError = e.message
      }

      if (!success || updateError) {
        console.error("❌ [WEBHOOK] Error updating credits:", updateError)
        return NextResponse.json(
          { error: "Error updating credits" },
          { status: 500 }
        )
      }

      console.log(
        `✅ [WEBHOOK] Successfully updated credits for user ${userId}. New balance: ${newCreditBalance}`
      )

      // Return a success response
      return NextResponse.json({ success: true })
    }

    // For other event types, just acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ [WEBHOOK] Error processing webhook:", error)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }
}
