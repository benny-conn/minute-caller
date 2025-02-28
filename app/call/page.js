"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PhoneCall } from "lucide-react"
import {
  getUserCredits,
  saveCallHistory,
  updateUserCredits,
  createClient,
} from "@/app/lib/supabase"
import CallInterface from "@/app/components/call/CallInterface"

// Loading component to display while suspense is active
function CallPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Preparing your call...
        </p>
      </div>
    </div>
  )
}

// Component that uses useSearchParams
function CallPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneNumber = searchParams.get("number")

  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [callEnded, setCallEnded] = useState(false)
  const [callResult, setCallResult] = useState(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Ensure we have a phone number
    if (!phoneNumber) {
      setError("No phone number provided. Please enter a number to call.")
      setIsLoading(false)
      return
    }

    // Load user data
    loadUserData()
  }, [phoneNumber])

  // Load user data
  async function loadUserData() {
    setIsLoading(true)
    setError("")

    try {
      console.log("[Call] Loading user data...")

      // Check if we're already in a refresh cycle to prevent infinite loops
      let shouldTryRefresh = false

      try {
        const refreshAttemptKey = "call_refresh_attempt"
        const refreshAttempt = sessionStorage.getItem(refreshAttemptKey)
        const currentTime = Date.now()

        // Only try to refresh if we haven't attempted recently (within last 10 seconds)
        if (
          !refreshAttempt ||
          currentTime - parseInt(refreshAttempt, 10) > 10000
        ) {
          console.log("[Call] Will attempt session refresh")
          sessionStorage.setItem(refreshAttemptKey, currentTime.toString())
          shouldTryRefresh = true
        } else {
          console.log(
            "[Call] Skipping session refresh - attempted too recently"
          )
        }
      } catch (storageErr) {
        // If sessionStorage is not available, continue without throttling
        console.log("[Call] Could not access sessionStorage:", storageErr)
        shouldTryRefresh = true
      }

      // First, try to refresh the session if appropriate
      if (shouldTryRefresh) {
        try {
          console.log("[Call] Attempting to refresh session...")
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession()

          if (!refreshError) {
            console.log(
              "[Call] Session refreshed successfully:",
              refreshData.session?.user?.email
            )
          } else {
            console.log("[Call] Session refresh failed:", refreshError.message)

            // If refresh fails with 403 Forbidden, try to get the session first
            if (refreshError.status === 403) {
              console.log("[Call] Getting current session after 403 error")
              const { data: sessionData } = await supabase.auth.getSession()

              if (sessionData?.session) {
                console.log("[Call] Session exists despite refresh error")
              } else {
                console.log("[Call] No valid session found after refresh error")
              }
            }
          }
        } catch (refreshErr) {
          console.error("[Call] Error refreshing session:", refreshErr)
        }
      }

      // Get current user using getUser directly from Supabase
      console.log("[Call] Getting user with supabase.auth.getUser()...")
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error("[Call] Authentication error:", userError.message)

        // Try to get the session as a fallback
        console.log("[Call] Trying to get session as fallback...")
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData?.session?.user) {
          console.log(
            "[Call] Found user in session:",
            sessionData.session.user.email
          )
          setUser(sessionData.session.user)

          // Get user credits
          const { credits, error: creditsError } = await getUserCredits(
            sessionData.session.user.id
          )
          if (creditsError) {
            console.error("[Call] Error fetching credits:", creditsError)
          }

          // Ensure we have a valid credits value
          setCredits(credits || 100) // Use 100 as default in case of errors
          setIsLoading(false)
          return
        }

        // If we still don't have a user, redirect to sign in
        setError("Authentication error. Please sign in again.")

        // Add a small delay before redirecting to prevent immediate redirect loops
        setTimeout(() => {
          router.push(
            `/auth/signin?next=${encodeURIComponent(
              "/call?number=" + phoneNumber
            )}`
          )
        }, 1000)

        setIsLoading(false)
        return
      }

      if (!userData?.user) {
        console.error("[Call] No user found")
        setError("Authentication error. Please sign in again.")

        // Add a small delay before redirecting to prevent immediate redirect loops
        setTimeout(() => {
          router.push(
            `/auth/signin?next=${encodeURIComponent(
              "/call?number=" + phoneNumber
            )}`
          )
        }, 1000)

        setIsLoading(false)
        return
      }

      // Set the authenticated user
      const user = userData.user
      console.log("[Call] User authenticated successfully:", user.email)
      setUser(user)

      // Get user credits
      const { credits, error: creditsError } = await getUserCredits(user.id)

      if (creditsError) {
        console.error("[Call] Error fetching credits:", creditsError)
        // Don't fail, just log the error and use 0 credits
      }

      // Ensure we have a valid credits value
      setCredits(credits || 100) // Use 100 as default in case of errors
    } catch (error) {
      console.error("[Call] Error loading user data:", error)
      // Don't show errors in development mode
      if (process.env.NODE_ENV !== "development") {
        setError("An unexpected error occurred. Please try again.")
      } else {
        // In development mode, continue with mock data
        setUser({ id: "dev-user-123", email: "dev@example.com" })
        setCredits(100)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleHangUp = () => {
    // This would be handled by the CallInterface component
  }

  const handleCallFinished = async result => {
    setCallEnded(true)
    setCallResult(result)

    if (!user) return

    try {
      // Call history is already saved in CallInterface component
      // No need to save it again here to avoid duplicates

      // Update user credits - this is also handled in CallInterface but we'll keep it here as a fallback
      const updateResult = await updateUserCredits(
        user.id,
        result.remainingCredits
      )

      if (updateResult.error) {
        console.error("Error updating credits:", updateResult.error)
      }
    } catch (error) {
      console.error("Error updating credits:", error)
      // Don't show errors to the user in the completed call view
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Preparing your call...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <PhoneCall className="h-6 w-6 text-indigo-400" />
            <span className="text-xl font-bold">MinuteCaller</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {error ? (
          <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-red-600 mb-4">
              <svg
                className="h-12 w-12 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-xl font-bold text-center">Error</h2>
            </div>
            <p className="text-center mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200">
                Go to Dashboard
              </Link>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                Go Back
              </button>
            </div>
          </div>
        ) : callEnded ? (
          <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-green-600 mb-4">
              <svg
                className="h-12 w-12 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-xl font-bold text-center">Call Ended</h2>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Duration:
                </span>
                <span className="font-medium">
                  {callResult?.duration} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                <span className="font-medium">{callResult?.cost} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Remaining Credits:
                </span>
                <span className="font-medium">
                  {callResult?.remainingCredits}
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200">
                Back to Dashboard
              </Link>
              <Link
                href={`/call?number=${encodeURIComponent(phoneNumber)}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                Call Again
              </Link>
            </div>
          </div>
        ) : (
          <CallInterface
            phoneNumber={phoneNumber}
            onHangUp={handleHangUp}
            userCredits={credits}
            onCallFinished={handleCallFinished}
            onClose={() => router.push("/dashboard")}
            user={user}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} MinuteCaller. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Main component that wraps the content in a Suspense boundary
export default function CallPage() {
  return (
    <Suspense fallback={<CallPageLoading />}>
      <CallPageContent />
    </Suspense>
  )
}
