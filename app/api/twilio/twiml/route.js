import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(request) {
  try {
    console.log("🔍 [API] /api/twilio/twiml endpoint called")

    // Create a new TwiML response using the updated Twilio 5.x syntax
    const { VoiceResponse } = twilio.twiml
    console.log("✅ [API] VoiceResponse type:", typeof VoiceResponse)

    const twiml = new VoiceResponse()

    // Parse form data or query params if any
    const body = await request.text()
    console.log("🔍 [API] Request body:", body)

    // Parse the form data to get the To parameter
    let to = null
    try {
      // Form data is sent as URL-encoded string (param1=value1&param2=value2)
      const params = new URLSearchParams(body)
      to = params.get("To")
      console.log("🔍 [API] Extracted To parameter:", to)
    } catch (parseError) {
      console.error("❌ [API] Error parsing request body:", parseError)
    }

    // Verify we have a valid phone number to dial
    if (!to) {
      console.error("❌ [API] Missing 'To' parameter in request")
      twiml.say(
        { voice: "alice" },
        "We're sorry, but no phone number was provided to dial. The call cannot be completed."
      )
      return new Response(twiml.toString(), {
        headers: {
          "Content-Type": "text/xml",
        },
      })
    }

    // Add a welcome message
    twiml.say(
      {
        voice: "alice",
      },
      "Thank you for using MinuteCaller. Your call is being connected now."
    )

    // Add a pause
    twiml.pause({ length: 1 })

    // Connect the call to the provided phone number
    const dial = twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER })
    dial.number(to)

    console.log("✅ [API] TwiML generated:", twiml.toString())

    // Return the TwiML as XML
    return new Response(twiml.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("❌ [API] Error generating TwiML:", error)

    // Create error TwiML in case of error
    try {
      const { VoiceResponse } = twilio.twiml
      const errorTwiml = new VoiceResponse()

      // Return an error message in TwiML format
      errorTwiml.say(
        { voice: "alice" },
        "We're sorry, but there was a problem connecting your call. Please try again later."
      )

      return new Response(errorTwiml.toString(), {
        headers: {
          "Content-Type": "text/xml",
        },
      })
    } catch (fallbackError) {
      console.error(
        "❌ [API] Critical error creating error TwiML:",
        fallbackError
      )
      return NextResponse.json(
        { error: "Failed to generate TwiML" },
        { status: 500 }
      )
    }
  }
}
