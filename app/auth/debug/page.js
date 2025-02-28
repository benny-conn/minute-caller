"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/lib/supabase"
import Link from "next/link"

export default function AuthDebug() {
  const [sessionInfo, setSessionInfo] = useState(null)
  const [cookies, setCookies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)

        // Get session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        // Format session data for display
        const session = data.session
        let formattedSession = null

        if (session) {
          formattedSession = {
            user: {
              id: session.user.id,
              email: session.user.email,
              created_at: new Date(session.user.created_at).toLocaleString(),
            },
            expires_at: new Date(session.expires_at * 1000).toLocaleString(),
            expires_in:
              Math.floor((session.expires_at * 1000 - Date.now()) / 1000 / 60) +
              " minutes",
            created_at: new Date(session.created_at * 1000).toLocaleString(),
          }
        }

        setSessionInfo(formattedSession)

        // Get cookies
        const cookieList = document.cookie.split(";").map(cookie => {
          const [name, value] = cookie.trim().split("=")
          return {
            name,
            exists: !!value,
            // Don't show actual values for security
            length: value ? value.length : 0,
          }
        })

        setCookies(cookieList)
      } catch (err) {
        console.error("Error checking auth:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      window.location.reload()
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Authentication Debug
        </h1>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <p className="text-gray-600 dark:text-gray-300">
              Loading authentication data...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 mb-6">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
              Error
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Session Status
              </h2>

              {sessionInfo ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      ✅ You are authenticated
                    </p>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">
                      User Info
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <p className="mb-1">
                        <span className="font-medium">Email:</span>{" "}
                        {sessionInfo.user.email}
                      </p>
                      <p className="mb-1">
                        <span className="font-medium">User ID:</span>{" "}
                        {sessionInfo.user.id}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {sessionInfo.user.created_at}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Session Info
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <p className="mb-1">
                        <span className="font-medium">Expires at:</span>{" "}
                        {sessionInfo.expires_at}
                      </p>
                      <p className="mb-1">
                        <span className="font-medium">Expires in:</span>{" "}
                        {sessionInfo.expires_in}
                      </p>
                      <p>
                        <span className="font-medium">Created at:</span>{" "}
                        {sessionInfo.created_at}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={refreshSession}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                    Refresh Session
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                    ⚠️ You are not authenticated
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-400 mt-2">
                    <Link href="/auth/signin" className="underline">
                      Sign in
                    </Link>{" "}
                    to access protected routes.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Cookies
              </h2>

              {cookies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Length
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {cookies.map((cookie, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                            {cookie.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {cookie.exists ? (
                              <span className="text-green-600 dark:text-green-400">
                                Present
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400">
                                Empty
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {cookie.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No cookies found
                </p>
              )}
            </div>

            <div className="mt-6 flex space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                Go to Dashboard
              </Link>

              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors">
                Go to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
