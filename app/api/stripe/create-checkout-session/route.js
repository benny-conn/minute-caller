import { NextResponse } from "next/server"
import { stripe, getCreditPackageById } from "@/app/lib/stripe"

export async function POST(request) {
  try {
    // Parse request body
    const { packageId, userId } = await request.json()

    // Validate package ID
    const creditPackage = getCreditPackageById(packageId)
    if (!creditPackage) {
      return NextResponse.json(
        { error: "Invalid credit package" },
        { status: 400 }
      )
    }

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    console.log(
      `🔍 [API] Creating checkout session for package ${packageId} (${creditPackage.credits} credits) for user ${userId}`
    )

    // Get base URL from environment or request
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${
        request.headers.get("x-forwarded-proto") || "http"
      }://${request.headers.get("host")}`

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.credits} calling credits`,
            },
            unit_amount: Math.round(creditPackage.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&package=${packageId}`,
      cancel_url: `${baseUrl}/dashboard?payment=canceled`,
      metadata: {
        userId: userId,
        creditAmount: creditPackage.credits.toString(),
        packageId: packageId,
        packagePrice: creditPackage.price.toString(),
      },
    })

    console.log(`✅ [API] Checkout session created: ${session.id}`)

    // Return the session ID and URL
    return NextResponse.json({
      id: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("❌ [API] Error creating checkout session:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
