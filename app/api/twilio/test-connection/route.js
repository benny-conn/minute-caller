import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(request) {
  console.log("🔍 [API] /api/twilio/test-connection endpoint called")
  try {
    // Parse the request body
    const body = await request.json()
    const { identity } = body
    console.log("🔍 [API] Request body:", { identity })

    if (!identity) {
      console.error("❌ [API] Missing identity in request")
      return NextResponse.json(
        { error: "Identity is required" },
        { status: 400 }
      )
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    console.log("🔍 [API] Checking Twilio credentials:", {
      hasSid: !!accountSid,
      hasAuthToken: !!authToken,
    })

    if (!accountSid || !authToken) {
      console.error("❌ [API] Missing Twilio credentials")
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 503 }
      )
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken)
    console.log("🔍 [API] Twilio client initialized")

    // Make a simple API call to Twilio to test the connection
    // We'll just fetch account info which is a lightweight call
    const account = await client.api.accounts(accountSid).fetch()

    console.log("✅ [API] Twilio connection test successful:", {
      accountName: account.friendlyName,
      accountStatus: account.status,
    })

    return NextResponse.json({
      success: true,
      accountName: account.friendlyName,
      accountStatus: account.status,
    })
  } catch (error) {
    console.error("❌ [API] Error testing Twilio connection:", error)

    // Check for specific Twilio error codes
    let errorMessage = error.message || "Failed to test Twilio connection"
    let errorCode = error.code || null

    // If it's a Twilio error with a code, provide more specific information
    if (errorCode) {
      console.error(`❌ [API] Twilio error code: ${errorCode}`)

      if (errorCode === 31002) {
        errorMessage =
          "Connection declined. This could be due to insufficient Twilio credits or account restrictions."
      } else if (errorCode === 20003) {
        errorMessage = "Authentication error. Check your Twilio credentials."
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}
