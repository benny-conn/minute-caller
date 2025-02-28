import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(request) {
  try {
    // Parse request body
    const { to, from, callbackUrl } = await request.json()

    if (!to || !from) {
      return NextResponse.json(
        { error: "To and From numbers are required" },
        { status: 400 }
      )
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      console.error("Missing Twilio credentials")
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 503 }
      )
    }

    // Initialize the Twilio client
    const client = twilio(accountSid, authToken)

    // Your Twilio phone number should be used as the 'from' parameter
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER || from

    // Create TwiML to handle the call
    const twimlUrl =
      callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/twiml`

    // Initiate the call
    const call = await client.calls.create({
      to: to,
      from: twilioNumber,
      url: twimlUrl,
    })

    return NextResponse.json({
      callSid: call.sid,
      status: call.status,
    })
  } catch (error) {
    console.error("Error initiating call:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initiate call" },
      { status: 500 }
    )
  }
}
