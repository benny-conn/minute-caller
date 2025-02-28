"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/lib/supabase"

export default function TwilioDebugPage() {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokenStatus, setTokenStatus] = useState(null)
  const [tokenDetails, setTokenDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    setLoading(true)
    setError(null)

    try {
      // Get user
      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)
    } catch (err) {
      console.error("Error checking auth:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function testTokenGeneration() {
    if (!user) {
      setError("You must be logged in to test token generation")
      return
    }

    setTokenStatus("generating")
    setError(null)

    try {
      const response = await fetch("/api/twilio/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate token")
      }

      // Parse the JWT token to show its contents
      const tokenParts = data.token.split(".")
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]))
          setTokenDetails({
            header: JSON.parse(atob(tokenParts[0])),
            payload,
            expiresAt: new Date(payload.exp * 1000).toLocaleString(),
            issuedAt: new Date(payload.iat * 1000).toLocaleString(),
          })
        } catch (e) {
          console.error("Error parsing token:", e)
        }
      }

      setTokenStatus("success")
    } catch (err) {
      console.error("Error testing token generation:", err)
      setError(err.message)
      setTokenStatus("error")
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Twilio Debug Page</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
          <div className="mb-4">
            <p className="font-semibold">Status:</p>
            <p
              className={`text-lg ${user ? "text-green-600" : "text-red-600"}`}>
              {loading
                ? "Checking..."
                : user
                ? "Authenticated"
                : "Not Authenticated"}
            </p>
          </div>

          {user && (
            <div>
              <p>
                <span className="font-semibold">User ID:</span> {user.id}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
            </div>
          )}

          {!user && !loading && (
            <p className="text-red-600">
              You need to be logged in to test Twilio functionality
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Twilio Token Test</h2>

          <button
            onClick={testTokenGeneration}
            disabled={!user || tokenStatus === "generating"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-4">
            {tokenStatus === "generating"
              ? "Generating..."
              : "Test Token Generation"}
          </button>

          {tokenStatus === "success" && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
              <p className="font-semibold">Token generated successfully!</p>
              {tokenDetails && (
                <div className="mt-2">
                  <p>
                    <span className="font-semibold">Issued At:</span>{" "}
                    {tokenDetails.issuedAt}
                  </p>
                  <p>
                    <span className="font-semibold">Expires At:</span>{" "}
                    {tokenDetails.expiresAt}
                  </p>
                  <p>
                    <span className="font-semibold">Algorithm:</span>{" "}
                    {tokenDetails.header?.alg}
                  </p>
                  <p>
                    <span className="font-semibold">Grants:</span>
                  </p>
                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto mt-1 text-xs">
                    {JSON.stringify(tokenDetails.payload?.grants, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {tokenStatus === "error" && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
              <p className="font-semibold">Error generating token:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Check if your Twilio account has sufficient funds</li>
            <li>
              Verify that all Twilio environment variables are correctly set:
              <ul className="list-disc pl-6 mt-1">
                <li>TWILIO_ACCOUNT_SID</li>
                <li>TWILIO_AUTH_TOKEN</li>
                <li>TWILIO_API_KEY</li>
                <li>TWILIO_API_SECRET</li>
                <li>TWILIO_APP_SID</li>
                <li>TWILIO_PHONE_NUMBER</li>
              </ul>
            </li>
            <li>
              Ensure your Twilio phone number is capable of making outbound
              calls
            </li>
            <li>
              Check if the TwiML application is correctly configured in the
              Twilio console
            </li>
            <li>
              Verify that the phone number you're trying to call doesn't have
              restrictions
            </li>
            <li>
              If error code 31002 persists, contact Twilio support for
              assistance
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
