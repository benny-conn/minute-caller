import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Twilio environment variables are set
    const variables = {
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_API_KEY: !!process.env.TWILIO_API_KEY,
      TWILIO_API_SECRET: !!process.env.TWILIO_API_SECRET,
      TWILIO_APP_SID: !!process.env.TWILIO_APP_SID,
      TWILIO_PHONE_NUMBER: !!process.env.NEXT_PUBLIC_TWILIO_CALLER_ID,
    }

    // Log the check for debugging
    console.log("🔍 [API] Checking Twilio environment variables:", variables)

    return NextResponse.json({ variables })
  } catch (error) {
    console.error(
      "❌ [API] Error checking Twilio environment variables:",
      error
    )
    return NextResponse.json(
      { error: error.message || "Failed to check environment variables" },
      { status: 500 }
    )
  }
}
