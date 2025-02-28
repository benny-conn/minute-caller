import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(request) {
  console.log("🔍 [API] /api/twilio/token endpoint called")
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
    const apiKey = process.env.TWILIO_API_KEY
    const apiSecret = process.env.TWILIO_API_SECRET
    const outgoingApplicationSid = process.env.TWILIO_APP_SID

    console.log("🔍 [API] Checking Twilio credentials:", {
      hasSid: !!accountSid,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      hasAppSid: !!outgoingApplicationSid,
    })

    if (!accountSid || !apiKey || !apiSecret || !outgoingApplicationSid) {
      console.error("❌ [API] Missing Twilio credentials")
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 503 }
      )
    }

    console.log(
      "🔍 [API] Creating AccessToken with outgoingApplicationSid:",
      outgoingApplicationSid
    )

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken
    const VoiceGrant = AccessToken.VoiceGrant

    // Create a Voice grant for this token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: outgoingApplicationSid,
      incomingAllow: true,
    })

    // Create an access token which we will sign and return to the client
    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity })
    token.addGrant(voiceGrant)

    // Generate the token
    const tokenString = token.toJwt()
    console.log(
      "✅ [API] Token generated successfully, length:",
      tokenString.length
    )

    return NextResponse.json({ token: tokenString, identity })
  } catch (error) {
    console.error("❌ [API] Error generating token:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    )
  }
}
