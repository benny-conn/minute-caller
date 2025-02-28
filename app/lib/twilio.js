// Check if we're running on the client side
const isClient = typeof window !== "undefined"

// Load Twilio Voice SDK for client-side if needed
let twilioClientSDK = null
let twilioClientSDKLoaded = false
let twilioClientSDKLoading = false

// Function to load the Twilio Client SDK
const loadTwilioClientSDK = async () => {
  if (!isClient || twilioClientSDKLoaded || twilioClientSDKLoading) return

  twilioClientSDKLoading = true
  console.log("Loading Twilio Client SDK")

  try {
    const twilioModule = await import("twilio-client")
    twilioClientSDK = twilioModule.default || twilioModule
    twilioClientSDKLoaded = true
    console.log("Twilio Client SDK loaded successfully")
  } catch (err) {
    console.error("Failed to load Twilio Client SDK:", err)
    twilioClientSDKLoading = false
  }
}

// Start loading the SDK if we're on the client side
if (isClient) {
  loadTwilioClientSDK()
}

// Only import Twilio on the server side
let twilioClient = null
if (!isClient) {
  try {
    console.log("Server-side detected, initializing Twilio client")
    const twilio = require("twilio")
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken)
      console.log(
        "Server client initialized with SID:",
        accountSid?.substring(0, 8) + "..."
      )
    } else {
      console.error("Missing credentials for server client")
    }
  } catch (error) {
    console.error("Server client initialization failed:", error)
  }
}

// Call pricing by country (example rates in credits per minute)
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
  if (!isClient) return false

  try {
    // Request access to microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // If successful, clean up the stream
    stream.getTracks().forEach(track => track.stop())

    return true
  } catch (error) {
    console.error("Error requesting media permissions:", error)
    return false
  }
}

// Generate a Twilio capability token for browser-based calling
export const generateToken = async identity => {
  console.log(`Generating token for identity: ${identity}`)

  // Make API call to get token from server
  try {
    console.log("Making API call to get token from server")
    const response = await fetch("/api/twilio/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identity }),
    })

    if (!response.ok) {
      console.error(
        `Token request failed: ${response.status} ${response.statusText}`
      )
      const errorText = await response
        .text()
        .catch(e => "Could not read response")
      console.error(`Error response:`, errorText)
      throw new Error(`Token request failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Token received successfully", {
      tokenLength: result.token?.length,
      identity: result.identity,
    })
    return result
  } catch (error) {
    console.error("Error requesting token:", error)
    return { error: error.message }
  }
}

// Initialize browser client for making calls
export const initializeTwilioDevice = async token => {
  console.log(`Initializing Twilio device with token length: ${token?.length}`)

  if (!isClient) {
    console.error("Cannot initialize device on server side")
    return {
      device: null,
      error: "Cannot initialize Twilio device on server side",
    }
  }

  // Ensure the Twilio Client SDK is loaded
  if (!twilioClientSDKLoaded) {
    try {
      await loadTwilioClientSDK()

      // If still not loaded after attempt, return error
      if (!twilioClientSDKLoaded) {
        console.error("Failed to load Twilio Client SDK")
        return { device: null, error: "Twilio Client SDK could not be loaded" }
      }
    } catch (error) {
      console.error("Error loading Twilio Client SDK:", error)
      return { device: null, error: "Error loading Twilio Client SDK" }
    }
  }

  if (!twilioClientSDK) {
    console.error("Twilio Client SDK not loaded")
    return { device: null, error: "Twilio Client SDK not available" }
  }

  try {
    // Check permissions first
    console.log("Checking media permissions")
    const hasPermission = await checkMediaPermissions()

    if (!hasPermission) {
      console.error("Permission denied for microphone")
      return { device: null, error: "Microphone permission denied" }
    }

    console.log("Media permissions granted")

    // Initialize the device with the token
    console.log("Creating new Device with token")

    // Make sure twilioClientSDK is loaded and has the Device constructor
    if (!twilioClientSDK.Device) {
      console.error("Twilio Client SDK Device constructor not available")
      return {
        device: null,
        error: "Twilio Client SDK Device constructor not available",
      }
    }

    const device = new twilioClientSDK.Device(token, {
      codecPreferences: ["opus", "pcmu"],
      fakeLocalDTMF: true,
      enableRingingState: true,
    })

    if (!device) {
      console.error("Failed to create device instance")
      return { device: null, error: "Failed to create device instance" }
    }

    console.log("Device created successfully")

    return { device, error: null }
  } catch (error) {
    console.error("Error initializing device:", error)
    return { device: null, error: error.message }
  }
}

// Initiate a call from browser to phone number
export const initiateCall = async (fromNumber, toNumber, callbackUrl) => {
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
