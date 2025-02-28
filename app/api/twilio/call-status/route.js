import { NextResponse } from "next/server"
import twilio from "twilio"

export async function GET(request) {
  try {
    // Get the callSid from the URL params
    const { searchParams } = new URL(request.url)
    const callSid = searchParams.get("callSid")

    if (!callSid) {
      return NextResponse.json(
        { error: "Call SID is required" },
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

    // Fetch the call
    const call = await client.calls(callSid).fetch()

    // Return the call details
    return NextResponse.json({
      status: call.status,
      duration: call.duration,
      direction: call.direction,
      from: call.from,
      to: call.to,
      startTime: call.startTime,
      endTime: call.endTime,
    })
  } catch (error) {
    console.error("Error fetching call status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch call status" },
      { status: 500 }
    )
  }
}
