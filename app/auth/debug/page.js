"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDebugPage() {
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [cookies, setCookies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
    parseCookies()
  }, [])

  async function checkAuth() {
    setLoading(true)
    setError(null)

    try {
      // Get session
      const { data: sessionData } = await supabase.auth.getSession()
      setSession(sessionData.session)

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

  function parseCookies() {
    const cookieList = []
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";")
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=")
        cookieList.push({ name, value })
      }
    }
    setCookies(cookieList)
  }

  async function refreshSession() {
    setRefreshing(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        throw error
      }
      setSession(data.session)
      setUser(data.user)
      parseCookies()
      console.log("Session refreshed successfully")
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      parseCookies()
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err.message)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-semibold">Status:</p>
              <p
                className={`text-lg ${
                  user ? "text-green-600" : "text-red-600"
                }`}>
                {loading
                  ? "Checking..."
                  : user
                  ? "Authenticated"
                  : "Not Authenticated"}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button onClick={checkAuth} disabled={loading} variant="outline">
                Refresh Status
              </Button>

              <Button
                onClick={refreshSession}
                disabled={refreshing || !session}
                variant="outline">
                Refresh Session
              </Button>

              <Button onClick={signOut} disabled={!user} variant="destructive">
                Sign Out
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : user ? (
              <div>
                <p>
                  <span className="font-semibold">ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(user.created_at).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Last Sign In:</span>{" "}
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            ) : (
              <p>No user authenticated</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : session ? (
              <div>
                <p>
                  <span className="font-semibold">Session ID:</span>{" "}
                  {session.id}
                </p>
                <p>
                  <span className="font-semibold">Expires:</span>{" "}
                  {new Date(session.expires_at * 1000).toLocaleString()}
                  {session.expires_at && (
                    <span
                      className={`ml-2 ${
                        Date.now() > session.expires_at * 1000
                          ? "text-red-600"
                          : "text-green-600"
                      }`}>
                      (
                      {Date.now() > session.expires_at * 1000
                        ? "Expired"
                        : "Valid"}
                      )
                    </span>
                  )}
                </p>
                <p>
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(session.created_at * 1000).toLocaleString()}
                </p>

                <div className="mt-4">
                  <p className="font-semibold">Access Token:</p>
                  <div className="bg-gray-100 p-2 rounded overflow-x-auto">
                    <code className="text-xs break-all">
                      {session.access_token}
                    </code>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-semibold">Refresh Token:</p>
                  <div className="bg-gray-100 p-2 rounded overflow-x-auto">
                    <code className="text-xs break-all">
                      {session.refresh_token}
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <p>No active session</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            {cookies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookies.map((cookie, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 pr-4 font-medium">{cookie.name}</td>
                        <td className="py-2 break-all">
                          <code className="text-xs">{cookie.value}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No cookies found</p>
            )}

            <Button onClick={parseCookies} variant="outline" className="mt-4">
              Refresh Cookies
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Check if you are authenticated (see Authentication Status)</li>
          <li>Verify your session is valid and not expired</li>
          <li>Ensure the necessary cookies are present (especially sb-*)</li>
          <li>
            Try refreshing your session using the "Refresh Session" button
          </li>
          <li>If issues persist, try signing out and signing in again</li>
          <li>Check browser console for any errors</li>
        </ol>
      </div>
    </div>
  )
}
