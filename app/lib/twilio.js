// Check if we're running on the client side
const isClient = typeof window !== "undefined"

// Load Twilio Voice SDK for client-side if needed
let twilioClientSDK = null
if (isClient) {
  // Dynamic import for client-side only
  console.log(
    "🔍 [Twilio] Client-side detected, attempting to load Twilio Client SDK"
  )
  import("twilio-client")
    .then(module => {
      twilioClientSDK = module.default || module
      console.log("✅ [Twilio] Client SDK loaded successfully")
    })
    .catch(err => {
      console.error("❌ [Twilio] Failed to load Client SDK:", err)
    })
}

// Only import Twilio on the server side
let twilioClient = null
if (!isClient) {
  try {
    console.log("🔍 [Twilio] Server-side detected, initializing Twilio client")
    const twilio = require("twilio")
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken)
      console.log(
        "✅ [Twilio] Server client initialized with SID:",
        accountSid?.substring(0, 8) + "..."
      )
    } else {
      console.error("❌ [Twilio] Missing credentials for server client")
    }
  } catch (error) {
    console.error("❌ [Twilio] Server client initialization failed:", error)
  }
}

// Development mode detection
const isDevelopment =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_TWILIO_ENABLED !== "true"

console.log("🔍 [Twilio] Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  TWILIO_ENABLED: process.env.NEXT_PUBLIC_TWILIO_ENABLED,
  isDevelopment,
})

// Call pricing by country (example rates in credits per minute)
// These would ideally be fetched from Twilio's API or a database
export const CALL_RATES = {
  US: 1, // 1 credit per minute for US
  CA: 1, // 1 credit per minute for Canada
  GB: 1.5, // 1.5 credits per minute for UK
  DE: 2, // 2 credits per minute for Germany
  FR: 2, // 2 credits per minute for France
  IN: 3, // 3 credits per minute for India
  CN: 5, // 5 credits per minute for China
  default: 3, // Default rate for unlisted countries
}

// Gets the estimated cost of a call to a specific country
export const getCallRate = countryCode => {
  return CALL_RATES[countryCode] || CALL_RATES.default
}

// Function to check browser media permissions
export const checkMediaPermissions = async () => {
  if (!isClient) return { hasPermission: false, error: "Server-side call" }

  try {
    // Request access to microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // If successful, clean up the stream
    stream.getTracks().forEach(track => track.stop())

    return { hasPermission: true, error: null }
  } catch (error) {
    console.error("Error requesting media permissions:", error)
    return {
      hasPermission: false,
      error:
        error.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone access in your browser settings."
          : `Could not access microphone: ${error.message}`,
    }
  }
}

// Generate a Twilio capability token for browser-based calling
export const generateToken = async identity => {
  console.log(
    `🔍 [Twilio] generateToken called for identity: ${identity}, isDevelopment: ${isDevelopment}`
  )

  // For development, return a mock token
  if (isDevelopment) {
    console.log("[DEV] Generating mock token for:", identity)
    return {
      token: `mock-token-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`,
      identity,
    }
  }

  // In production, make API call to get token from server
  try {
    console.log("🔍 [Twilio] Making API call to get token from server")
    const response = await fetch("/api/twilio/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identity }),
    })

    if (!response.ok) {
      console.error(
        `❌ [Twilio] Token request failed: ${response.status} ${response.statusText}`
      )
      const errorText = await response
        .text()
        .catch(e => "Could not read response")
      console.error(`❌ [Twilio] Error response:`, errorText)
      throw new Error(`Token request failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("✅ [Twilio] Token received successfully", {
      tokenLength: result.token?.length,
      identity: result.identity,
    })
    return result
  } catch (error) {
    console.error("❌ [Twilio] Error requesting token:", error)
    return { error: error.message }
  }
}

// Initialize browser client for making calls
export const initializeTwilioDevice = async token => {
  console.log(
    `🔍 [Twilio] initializeTwilioDevice called, token length: ${token?.length}, isDevelopment: ${isDevelopment}`
  )

  if (isDevelopment) {
    console.log("[DEV] Initializing mock Twilio device with token:", token)
    return {
      device: {
        on: (event, callback) => {
          console.log(`[DEV] Registered ${event} callback`)
          if (event === "ready") setTimeout(callback, 500)
        },
        connect: params => {
          console.log(`[DEV] Mock connecting with params:`, params)
          return {
            on: (event, callback) => {
              console.log(`[DEV] Connection registered ${event} callback`)
              if (event === "accept") setTimeout(callback, 1000)
            },
            disconnect: () => console.log("[DEV] Mock disconnected"),
            sendDigits: digits =>
              console.log(`[DEV] Sending digits: ${digits}`),
            mute: shouldMute => console.log(`[DEV] Mute set to: ${shouldMute}`),
          }
        },
        destroy: () => console.log("[DEV] Mock device destroyed"),
      },
      error: null,
    }
  }

  if (!isClient) {
    console.error("❌ [Twilio] Cannot initialize device on server side")
    return {
      device: null,
      error: "Cannot initialize Twilio device on server side",
    }
  }

  if (!twilioClientSDK) {
    console.error("❌ [Twilio] Twilio Client SDK not loaded")
    return { device: null, error: "Twilio Client SDK not available" }
  }

  try {
    // Check permissions first
    console.log("🔍 [Twilio] Checking media permissions")
    const { hasPermission, error: permissionError } =
      await checkMediaPermissions()

    if (!hasPermission) {
      console.error("❌ [Twilio] Permission denied:", permissionError)
      return { device: null, error: permissionError }
    }

    console.log("✅ [Twilio] Media permissions granted")

    // Initialize the device with the token
    console.log("🔍 [Twilio] Creating new Device with token")
    const device = new twilioClientSDK.Device(token, {
      codecPreferences: ["opus", "pcmu"],
      fakeLocalDTMF: true,
      enableRingingState: true,
    })
    console.log("✅ [Twilio] Device created successfully")

    return { device, error: null }
  } catch (error) {
    console.error("❌ [Twilio] Error initializing device:", error)
    return { device: null, error: error.message }
  }
}

// Initiate a call from browser to phone number
export const initiateCall = async (fromNumber, toNumber, callbackUrl) => {
  // For development, return mock data
  if (isDevelopment) {
    console.log(`[DEV] Initiating mock call from ${fromNumber} to ${toNumber}`)
    return {
      callSid: `mock-call-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`,
      status: "initiated",
    }
  }

  // In production, call the API
  try {
    const response = await fetch("/api/twilio/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromNumber,
        to: toNumber,
        callbackUrl,
      }),
    })

    if (!response.ok) {
      throw new Error(`Call initiation failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error initiating call:", error)
    return { error: error.message }
  }
}

// Get call status
export const getCallStatus = async callSid => {
  // For development, return mock data
  if (isDevelopment) {
    console.log(`[DEV] Getting mock status for call: ${callSid}`)
    return {
      status: "completed",
      duration: 120, // 2 minutes
      direction: "outbound-api",
      from: "+18005551234",
      to: "+18005556789",
      startTime: new Date(Date.now() - 120000).toISOString(),
      endTime: new Date().toISOString(),
    }
  }

  // In production, call the API
  try {
    const response = await fetch(`/api/twilio/call-status?callSid=${callSid}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Call status request failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting call status:", error)
    return { error: error.message }
  }
}
