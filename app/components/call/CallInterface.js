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

// Add a helper component for displaying errors with a link to the debug page
const ErrorWithDebugLink = ({ message }) => {
  const hasDebugSuggestion = message && message.includes("/auth/debug/twilio")

  if (!hasDebugSuggestion) {
    return <p>{message}</p>
  }

  // Extract the message part before the debug suggestion
  const mainMessage = message.split("Please visit")[0]

  return (
    <div>
      <p>{mainMessage}</p>
      <a
        href="/auth/debug/twilio"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block">
        Visit Twilio Debug Page
      </a>
    </div>
  )
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
  const [permissionStatus, setPermissionStatus] = useState("checking")
  const [isMuted, setIsMuted] = useState(false)
  const [isKeypadOpen, setIsKeypadOpen] = useState(false)
  const [isVolumeMuted, setIsVolumeMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [remainingCredits, setRemainingCredits] = useState(userCredits)
  const [errorMessage, setErrorMessage] = useState("")
  const [setupAttempts, setSetupAttempts] = useState(0)
  const [microStatus, setMicroStatus] = useState("pending")
  const [currentUser, setCurrentUser] = useState(user)
  const [callHistorySaved, setCallHistorySaved] = useState(false)

  // References for Twilio device and connection
  const deviceRef = useRef(null)
  const connectionRef = useRef(null)
  const callTimerRef = useRef(null)

  const timeoutRef = useRef(null)

  const countryCode = getCountryCodeFromPhoneNumber(phoneNumber)
  const callRate = getCallRate(countryCode)

  // Ensure we have a user, even if not passed as a prop
  useEffect(() => {
    async function ensureUser() {
      if (!currentUser) {
        try {
          const { user: fetchedUser } = await getCurrentUser()
          if (fetchedUser) {
            setCurrentUser(fetchedUser)
          } else {
            // Try to get user from session directly
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) {
              setCurrentUser(data.session.user)
            }
          }
        } catch (error) {
          console.error("Error ensuring user:", error)
        }
      }
    }

    ensureUser()
  }, [currentUser])

  // Load user credits on component mount
  useEffect(() => {
    async function fetchUserCredits() {
      if (currentUser?.id) {
        try {
          const credits = await getUserCredits(currentUser.id)
          setRemainingCredits(credits)
        } catch (error) {
          console.error("Error fetching user credits:", error)
        }
      }
    }

    fetchUserCredits()

    // Cleanup on unmount
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      handleHangUp()
    }
  }, [currentUser])

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
          // Try to get the user again
          const { user: fetchedUser } = await getCurrentUser()
          if (fetchedUser) {
            setCurrentUser(fetchedUser)
          } else {
            // Try to get user from session directly
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) {
              setCurrentUser(data.session.user)
            } else {
              // No user found, show error
              setErrorMessage("Authentication error. Please sign in again.")
              setCallStatus("error")
              return
            }
          }
        } catch (error) {
          console.error("Error getting user:", error)

          // Try to get user from session as a fallback
          try {
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) {
              setCurrentUser(data.session.user)
            } else {
              setErrorMessage("Authentication error. Please sign in again.")
              setCallStatus("error")
              return
            }
          } catch (sessionError) {
            console.error("Error getting session:", sessionError)
            setErrorMessage("Authentication error. Please sign in again.")
            setCallStatus("error")
            return
          }
        }
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
        body: JSON.stringify({ identity: currentUser?.id || "anonymous-user" }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.error || "Failed to get Twilio token")
      }

      const { token } = await tokenResponse.json()

      if (!token) {
        throw new Error("No token received from server")
      }

      // Initialize Twilio device
      console.log("Initializing Twilio device with token...")
      const deviceResult = await initializeTwilioDevice(token)

      if (deviceResult.error) {
        console.error("Error initializing Twilio device:", deviceResult.error)
        throw new Error(
          deviceResult.error || "Failed to initialize Twilio device"
        )
      }

      if (!deviceResult.device) {
        console.error("No device returned from initializeTwilioDevice")
        throw new Error(
          "Failed to initialize Twilio device - no device returned"
        )
      }

      deviceRef.current = deviceResult.device
      console.log("Twilio device initialized successfully")

      // Set up event listeners
      deviceRef.current.on("ready", () => {
        console.log("Twilio device is ready")
        setCallStatus("ready")
      })

      deviceRef.current.on("error", error => {
        console.error("Twilio device error:", error)
        setErrorMessage(
          error.message || "There was a problem connecting to the service."
        )
        setCallStatus("error")
      })

      deviceRef.current.on("disconnect", () => {
        console.log("Twilio device disconnected")
        handleCallEnded()
      })
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
    if (!deviceRef.current) {
      console.error("Cannot initiate call: Twilio device not initialized")
      setErrorMessage("Call setup incomplete. Please try again.")
      setCallStatus("error")
      return
    }

    if (callStatus === "connecting" || callStatus === "connected") {
      console.log("Cannot initiate call: call already in progress")
      return
    }

    // Ensure we have a user before initiating the call
    if (!currentUser?.id) {
      console.error("Cannot initiate call: no authenticated user")
      setErrorMessage("Authentication required. Please sign in again.")
      setCallStatus("error")
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

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Set a timeout for call connection
    timeoutRef.current = setTimeout(() => {
      if (callStatus === "connecting" || callStatus === "ringing") {
        console.log("Call connection timed out")
        setErrorMessage(
          "Call connection timed out. The recipient may not have answered."
        )
        handleHangUp()
        setCallStatus("error")
      }
    }, 60000) // 60 seconds timeout for call connection

    try {
      // Get outgoing call parameters
      const params = {
        To: formattedNumber,
        // Use Twilio verified number as caller ID, or the user's number
        CallerId: process.env.NEXT_PUBLIC_TWILIO_CALLER_ID || formattedNumber,
      }

      console.log("Call params:", params)

      // Connect using the device reference
      connectionRef.current = deviceRef.current.connect(params)

      if (!connectionRef.current) {
        throw new Error("Failed to establish connection")
      }

      // Monitor call states
      connectionRef.current.on("ringing", () => {
        console.log("Call is ringing")
        setCallStatus("ringing")
      })

      // Handle both "accept" and "accepted" events (different Twilio versions use different event names)
      connectionRef.current.on("accept", () => {
        console.log("Call accepted - transitioning to connected state")

        // Clear the connection timeout since the call was accepted
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Force state update to connected
        setCallStatus("connected")

        // Start timing the call
        startCallTimer()
      })

      connectionRef.current.on("accepted", () => {
        console.log(
          "Call accepted (via 'accepted' event) - transitioning to connected state"
        )

        // Clear the connection timeout since the call was accepted
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Force state update to connected
        setCallStatus("connected")

        // Start timing the call
        startCallTimer()
      })

      connectionRef.current.on("disconnect", () => {
        console.log("Call disconnected")

        // Clear the connection timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        handleCallEnded()
      })

      connectionRef.current.on("cancel", () => {
        console.log("Call was canceled")

        // Clear the connection timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        handleCallEnded()
      })

      connectionRef.current.on("reject", () => {
        console.log("Call was rejected")

        // Clear the connection timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        setErrorMessage("Call was rejected")
        handleCallEnded()
      })

      connectionRef.current.on("error", error => {
        console.error("Connection error:", error)

        // Clear the connection timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Handle specific Twilio error codes
        let errorMessage = "Call error: Connection failed"

        if (error.code === 31002) {
          errorMessage =
            "Call declined. This could be due to insufficient Twilio credits or account restrictions."
          console.log(
            "Twilio connection declined with code 31002. Check your Twilio account configuration."
          )

          // Log additional details to help diagnose the issue
          console.log("Attempting to get more details about the error:", {
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code,
            errorInfo: error.info || "No additional info",
            errorStack: error.stack || "No stack trace",
          })

          // Suggest visiting the debug page
          errorMessage +=
            " Please visit the Twilio debug page at /auth/debug/twilio for more information."
        } else if (error.code === 31000) {
          errorMessage =
            "Call error: Unable to connect to Twilio. Check your internet connection."
        } else if (error.code === 31003) {
          errorMessage =
            "Call error: Twilio service is unavailable. Please try again later."
        } else if (error.code === 31005) {
          errorMessage =
            "Call error: Twilio configuration issue. Please contact support."
        } else if (error.message) {
          errorMessage = `Call error: ${error.message}`
        }

        setErrorMessage(errorMessage)
        handleCallEnded()
      })
    } catch (error) {
      console.error("Error connecting call:", error)

      // Provide more detailed error message
      let errorMsg = "Failed to connect call"
      if (error.message) {
        errorMsg += `: ${error.message}`
      }

      // Add suggestion to check the debug page
      errorMsg +=
        ". Please visit the Twilio debug page at /auth/debug/twilio for more information."

      setErrorMessage(errorMsg)
      setCallStatus("error")
    }
  }

  // Start timer for call duration
  const startCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    // Reset call duration
    setCallDuration(0)
    const startTime = Date.now()

    console.log(
      "Starting call timer with rate:",
      callRate,
      "credits per minute"
    )

    callTimerRef.current = setInterval(() => {
      // Calculate duration in seconds
      const duration = Math.floor((Date.now() - startTime) / 1000)

      // Update the duration state
      setCallDuration(duration)

      // Calculate credits used based on duration and rate
      const minutesUsed = duration / 60
      const creditsUsed = Math.ceil(minutesUsed * callRate)

      // Calculate remaining credits
      const newRemainingCredits = Math.max(0, userCredits - creditsUsed)

      // Update remaining credits state
      setRemainingCredits(newRemainingCredits)

      // Log every 10 seconds for debugging
      if (duration % 10 === 0) {
        console.log(
          `Call in progress: ${duration}s, used ${creditsUsed} credits, remaining: ${newRemainingCredits}`
        )
      }

      // Check if user has enough credits to continue
      if (userCredits > 0 && newRemainingCredits <= 0) {
        console.warn("User out of credits, ending call")
        handleHangUp()
      }
    }, 1000)
  }

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
    console.log("Handling call ended, current status:", callStatus)

    // Stop the timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    // Update call status
    setCallStatus("ended")

    // Calculate cost based on duration and rate
    const finalDuration = callDuration
    const finalCost = calculateCallCost(finalDuration, callRate)
    const finalCreditsUsed = finalCost

    console.log(
      "Call ended with duration:",
      finalDuration,
      "seconds, cost:",
      finalCost,
      "credits"
    )

    // Only process credits and call history if we have a user and the call lasted more than 0 seconds
    if (finalDuration > 0) {
      try {
        // Deduct credits from user account
        if (currentUser?.id) {
          // Ensure we have a valid remaining credits value
          const currentRemainingCredits =
            typeof remainingCredits === "number"
              ? remainingCredits
              : userCredits

          // Calculate new balance, ensuring it's not negative
          const newCreditBalance = Math.max(
            0,
            currentRemainingCredits - finalCreditsUsed
          )

          console.log("Updating credits:", {
            userId: currentUser.id,
            oldBalance: currentRemainingCredits,
            used: finalCreditsUsed,
            newBalance: newCreditBalance,
          })

          // Update credits in database
          try {
            const updateResult = await updateUserCredits(
              currentUser.id,
              newCreditBalance
            )
            if (!updateResult.success) {
              console.error("Failed to update credits:", updateResult.error)
            } else {
              console.log("Credits updated successfully")
            }
          } catch (error) {
            console.error("Error updating credits:", error)
          }

          // Save call history - only if not already saved
          if (!callHistorySaved) {
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

              const historyResult = await saveCallHistory(callHistoryData)
              if (historyResult.error) {
                console.error(
                  "Failed to save call history:",
                  historyResult.error
                )
              } else {
                console.log("Call history saved successfully")
                setCallHistorySaved(true) // Mark as saved to prevent duplicates
              }
            } catch (error) {
              console.error("Error saving call history:", error)
            }
          } else {
            console.log("Call history already saved, skipping")
          }

          // Call the onCallFinished callback with the result
          onCallFinished({
            duration: finalDuration,
            cost: finalCost,
            remainingCredits: newCreditBalance,
          })

          // Automatically redirect to dashboard after a short delay
          // This eliminates the need for the user to click "Close"
          setTimeout(() => {
            handleClose()
          }, 2000) // 2 second delay to show the call ended screen briefly
        } else {
          console.error("Cannot update credits: No user ID available")
        }
      } catch (error) {
        console.error("Error processing call end:", error)
        // Still redirect even if there was an error
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } else {
      console.log("Call duration is 0, skipping credit update and history")
      // Still redirect for zero-duration calls
      setTimeout(() => {
        handleClose()
      }, 2000)
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

  // Create a dedicated function for handling close button clicks
  const handleClose = () => {
    console.log("Close button clicked, current status:", callStatus)

    // First disconnect any active call
    if (connectionRef.current) {
      try {
        console.log("Disconnecting active call")
        connectionRef.current.disconnect()
      } catch (err) {
        console.error("Error disconnecting call:", err)
      }
      connectionRef.current = null
    }

    // Clean up device if it exists
    if (deviceRef.current) {
      try {
        console.log("Destroying Twilio device")
        deviceRef.current.destroy()
      } catch (err) {
        console.error("Error destroying device:", err)
      }
      deviceRef.current = null
    }

    // Clear any active timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Always call onClose if provided
    if (onClose) {
      console.log("Calling onClose callback")
      // Use setTimeout to ensure all cleanup is done before calling onClose
      setTimeout(() => {
        onClose()
      }, 100)
    }
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
          <ErrorWithDebugLink message={errorMessage} />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">
              Close
            </button>
          </div>
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
            : callStatus === "ended"
            ? "Call Ended"
            : callStatus === "error"
            ? "Call Error"
            : "Starting Call"}
        </h3>
        <button
          onClick={handleClose}
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
              <div className="w-12 h-12 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
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

          {callStatus === "ended" && (
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
              <ErrorWithDebugLink message={errorMessage} />
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

        {(callStatus === "connecting" || callStatus === "ringing") && (
          <button
            onClick={handleHangUp}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${styles.callEndGradient} text-white w-full`}>
            <PhoneOff className="h-5 w-5" />
            {callStatus === "connected" ? "End Call" : "Cancel"}
          </button>
        )}

        {callStatus === "connected" && (
          <>
            <div className="grid grid-cols-3 gap-3 w-full">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  isMuted
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}>
                {isMuted ? (
                  <MicOff className="h-5 w-5 mb-1" />
                ) : (
                  <Mic className="h-5 w-5 mb-1" />
                )}
                <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              {/* End call button */}
              <button
                onClick={handleHangUp}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${styles.callEndGradient} text-white`}>
                <PhoneOff className="h-5 w-5 mb-1" />
                <span className="text-xs">End</span>
              </button>

              {/* Keypad button */}
              <button
                onClick={toggleKeypad}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  isKeypadOpen
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}>
                <KeypadIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Keypad</span>
              </button>

              {/* Volume button */}
              <button
                onClick={toggleVolume}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  isVolumeMuted
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                } col-span-3`}>
                {isVolumeMuted ? (
                  <VolumeX className="h-5 w-5 mb-1" />
                ) : (
                  <Volume2 className="h-5 w-5 mb-1" />
                )}
                <span className="text-xs">
                  {isVolumeMuted ? "Unmute Speaker" : "Mute Speaker"}
                </span>
              </button>
            </div>
          </>
        )}

        {callStatus === "initializing" && (
          <button
            disabled
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gray-400 text-white w-full opacity-50 cursor-not-allowed`}>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Preparing Call...
          </button>
        )}

        {callStatus === "ended" && (
          <button
            onClick={handleClose}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gray-600 hover:bg-gray-700 text-white w-full`}>
            <X className="h-5 w-5" />
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Keypad */}
      {isKeypadOpen && callStatus === "connected" && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
              key => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-xl font-medium text-gray-800 dark:text-gray-200">
                  {key}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
