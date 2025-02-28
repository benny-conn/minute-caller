"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  VolumeX,
  Volume2,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react"
import {
  formatPhoneNumber,
  formatDuration,
  getCountryCodeFromPhoneNumber,
  calculateCallCost,
} from "@/app/lib/utils"
import {
  getCallRate,
  generateToken,
  initializeTwilioDevice,
  checkMediaPermissions,
} from "@/app/lib/twilio"
import {
  getUserCredits,
  updateUserCredits,
  saveCallHistory,
} from "@/app/lib/supabase"
import { getCurrentUser } from "@/app/lib/supabase"
import { supabase } from "@/app/lib/supabase"

// Custom Keypad icon component since lucide-react doesn't have one
const KeypadIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="4" y="4" width="4" height="4" rx="1" />
    <rect x="10" y="4" width="4" height="4" rx="1" />
    <rect x="16" y="4" width="4" height="4" rx="1" />
    <rect x="4" y="10" width="4" height="4" rx="1" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
    <rect x="16" y="10" width="4" height="4" rx="1" />
    <rect x="4" y="16" width="4" height="4" rx="1" />
    <rect x="10" y="16" width="4" height="4" rx="1" />
    <rect x="16" y="16" width="4" height="4" rx="1" />
  </svg>
)

// Add a custom style block
const styles = {
  gradientBg: "bg-gradient-to-r from-indigo-600 to-violet-600",
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  callEndGradient:
    "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700",
  callStatusGlowEffects: {
    ringing:
      "animate-pulse shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20",
    connected: "shadow-lg shadow-green-200 dark:shadow-green-900/20",
    disconnected: "shadow-lg shadow-red-200 dark:shadow-red-900/20",
  },
}

export default function CallInterface({
  phoneNumber,
  onHangUp,
  userCredits = 0,
  onCallFinished = () => {},
  onClose,
  user,
}) {
  const [callStatus, setCallStatus] = useState("initializing") // initializing, connecting, active, ended, error
  const [permissionStatus, setPermissionStatus] = useState("pending") // pending, granted, denied
  const [isMuted, setIsMuted] = useState(false)
  const [isKeypadOpen, setIsKeypadOpen] = useState(false)
  const [isVolumeMuted, setIsVolumeMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [remainingCredits, setRemainingCredits] = useState(userCredits)
  const [errorMessage, setErrorMessage] = useState("")
  const [setupAttempts, setSetupAttempts] = useState(0)
  const [microStatus, setMicroStatus] = useState("checking")
  const [currentUser, setCurrentUser] = useState(user)

  // References for Twilio device and connection
  const deviceRef = useRef(null)
  const connectionRef = useRef(null)
  const timerRef = useRef(null)
  const loadingTimer = useRef(null)
  const timeoutRef = useRef(null)

  const countryCode = getCountryCodeFromPhoneNumber(phoneNumber)
  const callRate = getCallRate(countryCode)

  // Ensure we have a user, even if not passed as a prop
  useEffect(() => {
    async function ensureUser() {
      if (!currentUser) {
        try {
          console.log("Fetching user in CallInterface component")
          const { user: fetchedUser } = await getCurrentUser()
          if (fetchedUser) {
            console.log("User found via getCurrentUser:", fetchedUser.id)
            setCurrentUser(fetchedUser)
          } else {
            // Try to get user from session directly
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) {
              console.log("User found via session:", data.session.user.id)
              setCurrentUser(data.session.user)
            } else {
              console.error("No user found in session or getCurrentUser")
              setErrorMessage("Authentication error. Please sign in again.")
              setCallStatus("error")
            }
          }
        } catch (error) {
          console.error("Error ensuring user:", error)
          setErrorMessage("Authentication error. Please try signing in again.")
          setCallStatus("error")
        }
      } else {
        console.log("User already provided as prop:", currentUser.id)
      }
    }

    ensureUser()
  }, [currentUser])

  // Update currentUser when user prop changes
  useEffect(() => {
    if (user && (!currentUser || user.id !== currentUser.id)) {
      console.log("Updating currentUser from prop:", user.id)
      setCurrentUser(user)
    }
  }, [user, currentUser])

  // Load user credits on component mount
  useEffect(() => {
    async function fetchUserCredits() {
      if (currentUser?.id) {
        try {
          console.log("Fetching credits for user:", currentUser.id)
          const { credits } = await getUserCredits(currentUser.id)
          if (credits !== undefined) {
            setRemainingCredits(credits)
          } else {
            // Use the credits passed as prop if API call fails
            setRemainingCredits(userCredits)
          }
        } catch (error) {
          console.error("Error fetching user credits:", error)
          // Fallback to prop value
          setRemainingCredits(userCredits)
        }
      } else {
        // Use the credits passed as prop if no user
        setRemainingCredits(userCredits)
      }
    }

    fetchUserCredits()

    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (loadingTimer.current) clearTimeout(loadingTimer.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      handleHangUp()
    }
  }, [currentUser, userCredits])

  // Main call setup function with retry mechanism
  useEffect(() => {
    setupCall()

    return () => {
      // Cleanup device on component unmount
      if (deviceRef.current) {
        console.log("Cleaning up Twilio device on unmount")
        try {
          deviceRef.current.destroy()
        } catch (err) {
          console.error("Error destroying device:", err)
        }
        deviceRef.current = null
      }
    }
  }, [setupAttempts]) // Retry when setupAttempts changes

  // Initialize call setup
  const setupCall = async () => {
    try {
      console.log("Setting up call...")
      setCallStatus("initializing")

      // Check if we have a user
      if (!currentUser?.id) {
        try {
          console.log("No user found, attempting to get user again")
          // Try to get the user again
          const { user: fetchedUser } = await getCurrentUser()
          if (fetchedUser) {
            console.log(
              "User found via getCurrentUser in setupCall:",
              fetchedUser.id
            )
            setCurrentUser(fetchedUser)
          } else {
            // Try to get user from session directly
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) {
              console.log(
                "User found via session in setupCall:",
                data.session.user.id
              )
              setCurrentUser(data.session.user)
            } else {
              // No user found, show error
              console.error("No user found in setupCall")
              setErrorMessage("Authentication error. Please sign in again.")
              setCallStatus("error")
              return
            }
          }
        } catch (error) {
          console.error("Error getting user in setupCall:", error)
          setErrorMessage("Authentication error. Please sign in again.")
          setCallStatus("error")
          return
        }
      } else {
        console.log("Using existing user in setupCall:", currentUser.id)
      }

      // Check microphone permissions
      const permissionResult = await checkMediaPermissions()
      setPermissionStatus(permissionResult ? "granted" : "denied")
      setMicroStatus(permissionResult ? "granted" : "denied")

      if (!permissionResult) {
        setErrorMessage("Microphone access is required to make calls.")
        setCallStatus("error")
        return
      }

      // Get Twilio token
      const tokenResponse = await fetch("/api/twilio/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: currentUser?.id || "anonymous-user",
          // Include a timestamp to prevent caching issues
          timestamp: new Date().getTime(),
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.error || "Failed to get Twilio token")
      }

      const { token } = await tokenResponse.json()

      if (!token) {
        throw new Error("No token received from server")
      }

      console.log("Twilio token received, initializing device")

      // Initialize Twilio device
      const device = await initializeTwilioDevice(token)
      deviceRef.current = device

      // Set up event listeners
      device.on("ready", () => {
        console.log("Twilio device is ready")
        setCallStatus("ready")
      })

      device.on("error", error => {
        console.error("Twilio device error:", error)
        setErrorMessage(
          error.message || "There was a problem connecting to the service."
        )
        setCallStatus("error")
      })

      device.on("disconnect", () => {
        console.log("Twilio device disconnected")
        handleCallEnded()
      })

      // Set a timeout for device initialization
      loadingTimer.current = setTimeout(() => {
        if (callStatus === "initializing") {
          setErrorMessage(
            "Call setup is taking longer than expected. Please try again."
          )
          setCallStatus("error")
        }
      }, 15000) // 15 seconds timeout
    } catch (error) {
      console.error("Error setting up call:", error)
      setErrorMessage(
        error.message || "There was a problem setting up the call."
      )
      setCallStatus("error")
    }
  }

  // Function to initiate an outbound call
  const initiateOutboundCall = number => {
    if (
      !deviceRef.current ||
      callStatus === "connecting" ||
      callStatus === "connected"
    ) {
      console.log(
        "Cannot initiate call: device not ready or call already in progress"
      )
      return
    }

    // Format phone number to E.164 format
    let formattedNumber = number
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = "+" + formattedNumber
    }
    // Remove any non-numeric characters except leading +
    formattedNumber = "+" + formattedNumber.substring(1).replace(/\D/g, "")

    console.log(`Initiating call to: ${formattedNumber}`)
    setCallStatus("connecting")

    try {
      // Get outgoing call parameters
      const params = {
        To: formattedNumber,
        // Use Twilio verified number as caller ID, or the user's number
        CallerId: process.env.NEXT_PUBLIC_TWILIO_CALLER_ID || formattedNumber,
      }

      console.log("Call params:", params)
      connectionRef.current = deviceRef.current.connect(params)

      // Monitor call states
      connectionRef.current.on("ringing", () => {
        console.log("Call is ringing")
        setCallStatus("ringing")
      })

      connectionRef.current.on("accept", () => {
        console.log("Call accepted")
        setCallStatus("connected")

        // Start timing the call
        startCallTimer()
      })

      connectionRef.current.on("disconnect", () => {
        console.log("Call disconnected")
        handleCallEnded()
      })

      connectionRef.current.on("cancel", () => {
        console.log("Call was canceled")
        handleCallEnded()
      })

      connectionRef.current.on("reject", () => {
        console.log("Call was rejected")
        setErrorMessage("Call was rejected")
        handleCallEnded()
      })

      connectionRef.current.on("error", error => {
        console.error("Connection error:", error)
        setErrorMessage(`Call error: ${error.message || "Connection failed"}`)
        handleCallEnded()
      })
    } catch (error) {
      console.error("Error connecting call:", error)
      setErrorMessage(`Failed to connect call: ${error.message}`)
      setCallStatus("error")
    }
  }

  // Start timer for call duration
  const startCallTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    setCallDuration(0)
    const startTime = Date.now()

    timerRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      setCallDuration(duration)

      // Calculate credits used (1 credit per minute)
      const minutesUsed = duration / 60
      const credits = Math.ceil(minutesUsed * callRate)
      setRemainingCredits(prev => Math.max(0, prev - credits))

      // Check if user has enough credits to continue
      if (userCredits > 0 && credits >= userCredits) {
        console.warn("User running out of credits")
      }
    }, 1000)
  }

  // Initialize call timer when call becomes active
  useEffect(() => {
    let intervalId

    if (callStatus === "active") {
      intervalId = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1

          // Calculate remaining credits
          const cost = calculateCallCost(newDuration, callRate)
          const newRemainingCredits = userCredits - cost
          setRemainingCredits(newRemainingCredits)

          // Auto-end call if credits run out
          if (newRemainingCredits <= 0) {
            handleHangUp()
          }

          return newDuration
        })
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [callStatus, userCredits, callRate])

  // Handle call hangup
  const handleHangUp = () => {
    console.log("Hanging up call")

    if (connectionRef.current) {
      try {
        connectionRef.current.disconnect()
      } catch (error) {
        console.error("Error disconnecting call:", error)
      }
      connectionRef.current = null
    }

    // If we were connected, this was a completed call
    if (callStatus === "connected") {
      handleCallEnded()
    } else {
      // This was a canceled call
      setCallStatus("ready")
    }
  }

  // Function to handle call end
  const handleCallEnded = async () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Update call status
    setCallStatus("ended")

    // Calculate cost based on duration and rate
    const finalDuration = callDuration
    const finalCost = calculateCallCost(finalDuration, callRate)
    const finalCreditsUsed = finalCost

    console.log(
      `Call ended - Duration: ${finalDuration}s, Cost: ${finalCost} credits`
    )

    // Only process credits and call history if we have a user and the call lasted more than 0 seconds
    if (finalDuration > 0) {
      try {
        // Deduct credits from user account
        if (currentUser?.id) {
          console.log(`Processing call end for user: ${currentUser.id}`)

          // Deduct credits
          const newCreditBalance = Math.max(
            0,
            remainingCredits - finalCreditsUsed
          )
          console.log(`New credit balance: ${newCreditBalance}`)

          // Update credits in database
          try {
            const updateResult = await updateUserCredits(
              currentUser.id,
              newCreditBalance
            )
            if (updateResult.error) {
              console.error("Error updating credits:", updateResult.error)
            } else {
              console.log("Credits updated successfully")
            }
          } catch (error) {
            console.error("Error updating credits:", error)
          }

          // Save call history
          try {
            const callHistoryData = {
              user_id: currentUser.id,
              phone_number: phoneNumber,
              duration: finalDuration,
              cost: finalCost,
              status: "completed",
              created_at: new Date().toISOString(),
            }

            console.log("Saving call history:", callHistoryData)
            const saveResult = await saveCallHistory(callHistoryData)

            if (saveResult.error) {
              console.error("Error saving call history:", saveResult.error)
            } else {
              console.log("Call history saved successfully")
            }
          } catch (error) {
            console.error("Error saving call history:", error)
          }

          // Call the onCallFinished callback with the result
          onCallFinished({
            duration: finalDuration,
            cost: finalCost,
            remainingCredits: newCreditBalance,
          })
        } else {
          console.warn("No user ID available to save call history")
          // Still call the callback with the result even if we couldn't save to the database
          onCallFinished({
            duration: finalDuration,
            cost: finalCost,
            remainingCredits: remainingCredits - finalCreditsUsed,
          })
        }
      } catch (error) {
        console.error("Error processing call end:", error)
        // Still call the callback with the result even if there was an error
        onCallFinished({
          duration: finalDuration,
          cost: finalCost,
          remainingCredits: remainingCredits - finalCreditsUsed,
        })
      }
    } else {
      console.log("Call duration was 0, not processing credits or history")
    }

    // Clean up the connection
    if (connectionRef.current) {
      try {
        connectionRef.current.disconnect()
      } catch (e) {
        console.error("Error disconnecting call:", e)
      }
      connectionRef.current = null
    }

    // Notify parent component
    if (onHangUp) {
      onHangUp()
    }
  }

  // Format the call duration display (MM:SS)
  const formatCallDuration = seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  // Reset the call interface (for retrying)
  const handleReset = () => {
    setErrorMessage("")
    setSetupAttempts(prev => prev + 1) // Trigger a retry
  }

  const handleKeypadPress = key => {
    // In development mode, just log the press
    if (process.env.NODE_ENV === "development") {
      console.log("Keypad press:", key)
      return
    }

    // Send DTMF tones for real calls
    if (connectionRef.current) {
      try {
        connectionRef.current.sendDigits(key)
      } catch (error) {
        console.error("Error sending digits:", error)
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)

    // In development mode, just toggle the state
    if (process.env.NODE_ENV === "development") {
      return
    }

    // For real calls, mute the connection
    if (connectionRef.current) {
      try {
        connectionRef.current.mute(!isMuted)
      } catch (error) {
        console.error("Error toggling mute:", error)
      }
    }
  }

  const toggleVolume = () => {
    setIsVolumeMuted(!isVolumeMuted)

    // In a real implementation, this would adjust the speaker volume
    // but Twilio Client doesn't have a direct API for this.
    // You would need to adjust audio elements or use the Web Audio API.
  }

  const toggleKeypad = () => {
    setIsKeypadOpen(!isKeypadOpen)
  }

  // Conditionally render based on permission status
  if (permissionStatus === "denied") {
    return (
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 text-white p-6">
          <h2 className="text-2xl font-bold text-center mb-1">
            Microphone Access Required
          </h2>
        </div>
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="mb-4">
            {errorMessage ||
              "To make calls, you need to allow microphone access in your browser."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render error state if there's an issue with the call
  if (callStatus === "error") {
    return (
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 text-white p-6">
          <h2 className="text-2xl font-bold text-center mb-1">Call Error</h2>
        </div>
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="mb-4">
            {errorMessage ||
              "There was a problem with your call. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden max-w-md w-full mx-auto">
      {/* Header */}
      <div
        className={`p-4 flex justify-between items-center ${styles.gradientBg} text-white`}>
        <h3 className="text-lg font-semibold">
          {callStatus === "connected"
            ? "On Call"
            : callStatus === "ringing"
            ? "Calling..."
            : callStatus === "connecting"
            ? "Connecting..."
            : callStatus === "disconnected"
            ? "Call Ended"
            : callStatus === "error"
            ? "Call Error"
            : "Starting Call"}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Call status display */}
      <div className="p-6 flex flex-col items-center">
        {/* Phone number */}
        <div className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {phoneNumber}
        </div>

        {/* Status indicator */}
        <div className="flex flex-col items-center justify-center mb-4">
          {callStatus === "initializing" && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Initializing call...
              </p>
            </div>
          )}

          {callStatus === "ready" && (
            <div className="flex flex-col items-center">
              <div
                className={`p-3 rounded-full bg-amber-100 dark:bg-amber-900/50 mb-2 ${styles.callStatusGlowEffects.disconnected}`}>
                <Phone className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to call...
              </p>
            </div>
          )}

          {callStatus === "connecting" && (
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-2 animate-pulse">
                <Phone className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Connecting call...
              </p>
            </div>
          )}

          {callStatus === "ringing" && (
            <div className="flex flex-col items-center">
              <div
                className={`p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-2 ${styles.callStatusGlowEffects.ringing}`}>
                <Phone className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Ringing...</p>
            </div>
          )}

          {callStatus === "connected" && (
            <div className="flex flex-col items-center">
              <div
                className={`p-3 rounded-full bg-green-100 dark:bg-green-900/50 mb-2 ${styles.callStatusGlowEffects.connected}`}>
                <Volume2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-lg text-green-600 dark:text-green-400">
                {formatCallDuration(callDuration)}
              </p>
            </div>
          )}

          {callStatus === "disconnected" && (
            <div className="flex flex-col items-center">
              <div
                className={`p-3 rounded-full bg-rose-100 dark:bg-rose-900/50 mb-2 ${styles.callStatusGlowEffects.disconnected}`}>
                <PhoneOff className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Call ended</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                Duration: {formatCallDuration(callDuration)}
              </p>

              {callDuration > 0 && (
                <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-2 text-center">
                  <p className="text-amber-800 dark:text-amber-200">
                    <span className="font-semibold">
                      {Math.ceil(callDuration / 60)}
                    </span>{" "}
                    credits used
                  </p>
                </div>
              )}
            </div>
          )}

          {callStatus === "error" && (
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50 mb-2">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="font-medium text-red-600 dark:text-red-400">
                Call failed
              </p>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-1 max-w-xs">
                {errorMessage || "Something went wrong with the call."}
              </p>
            </div>
          )}

          {microStatus === "denied" && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 max-w-xs mx-auto">
              <MicOff className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Microphone access denied. Please enable it in your browser
                settings.
              </p>
            </div>
          )}
        </div>

        {/* Credits information */}
        {(callStatus === "ready" ||
          callStatus === "connecting" ||
          callStatus === "ringing" ||
          callStatus === "connected") && (
          <div className="mt-2 mb-4 w-full max-w-xs mx-auto">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-2 text-center">
              <p className="text-indigo-800 dark:text-indigo-200 text-sm">
                Available credits:{" "}
                <span className="font-semibold">
                  {Math.max(0, userCredits - Math.ceil(callDuration / 60))}
                </span>
              </p>
              {callStatus === "connected" && (
                <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">
                  Using approximately {callRate} credit per minute
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 flex gap-3 justify-center">
        {(callStatus === "ready" || callStatus === "error") && (
          <button
            onClick={() => initiateOutboundCall(phoneNumber)}
            disabled={microStatus === "denied" || !deviceRef.current}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${styles.buttonGradient} text-white w-full disabled:opacity-50 disabled:cursor-not-allowed`}>
            <Phone className="h-5 w-5" />
            {callStatus === "error" ? "Retry Call" : "Start Call"}
          </button>
        )}

        {(callStatus === "connecting" ||
          callStatus === "ringing" ||
          callStatus === "connected") && (
          <button
            onClick={handleHangUp}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${styles.callEndGradient} text-white w-full`}>
            <PhoneOff className="h-5 w-5" />
            {callStatus === "connected" ? "End Call" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  )
}
