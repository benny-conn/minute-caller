"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import {
  PhoneCall,
  History,
  User,
  CreditCard,
  LogOut,
  Zap,
  DollarSign,
} from "lucide-react"
import {
  getCurrentUser,
  getUserCredits,
  getUserCallHistory,
} from "@/app/lib/supabase"
import {
  formatPhoneNumber,
  formatDuration,
  formatDate,
  formatCurrency,
} from "@/app/lib/utils"
import {
  CREDIT_PACKAGES,
  getStripe,
  createCheckoutSession,
  getCreditPackageById,
} from "@/app/lib/stripe"
import { useSearchParams } from "next/navigation"
import CountryRateCalculator from "@/app/components/CountryRateCalculator"
import Footer from "@/app/components/Footer"

// Add a custom style block
const styles = {
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  panelShadow: "shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  inputFocus:
    "focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500",
  cardHover: "transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
  activeTabGradient: "bg-gradient-to-r from-indigo-600 to-violet-600",
}

// Loading component to display while suspense is active
function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  )
}

// Component that uses useSearchParams
function DashboardContent() {
  const [activeTab, setActiveTab] = useState("dial")
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [callHistory, setCallHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)

  // Get query parameters
  const searchParams = useSearchParams()
  const paymentParam = searchParams.get("payment")
  const sessionId = searchParams.get("session_id")

  // Load user data on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  // Handle payment status from URL parameters
  useEffect(() => {
    if (paymentParam === "success" && sessionId) {
      setPaymentStatus("success")
      // Get package details if available
      const packageId = searchParams.get("package")
      const packageDetails = packageId ? getCreditPackageById(packageId) : null

      // Show success message
      if (packageId) {
        showSuccessToast(packageId)
      }

      // Refresh credits after successful payment
      if (user) {
        refreshUserCredits(user.id)
      }
    } else if (paymentParam === "canceled") {
      setPaymentStatus("canceled")
    }
  }, [paymentParam, sessionId, user, searchParams])

  async function loadUserData() {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { user, error: userError } = await getCurrentUser()

      if (userError || !user) {
        console.error("Authentication failed:", userError)
        setError("Authentication failed. Please try signing in again.")

        // Add a small delay before redirecting to prevent immediate redirect loops
        setTimeout(() => {
          window.location.href = `/auth/signin?next=${encodeURIComponent(
            window.location.pathname
          )}`
        }, 2000)

        setIsLoading(false)
        return
      }

      console.log("User authenticated successfully:", user.email)
      setUser(user)

      // Get user credits
      const { credits, error: creditsError } = await getUserCredits(user.id)

      if (!creditsError) {
        setCredits(credits)
      } else {
        console.error("Error fetching credits:", creditsError)
      }

      // Get call history
      const { calls, error: historyError } = await getUserCallHistory(user.id)

      if (!historyError) {
        setCallHistory(calls || [])
      } else {
        console.error("Error fetching call history:", historyError)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load user data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh user credits after purchase
  async function refreshUserCredits(userId) {
    try {
      const { credits, error: creditsError } = await getUserCredits(userId)

      if (!creditsError) {
        setCredits(credits)
        console.log("Credits refreshed after purchase:", credits)
      } else {
        console.error("Error refreshing credits:", creditsError)
      }
    } catch (error) {
      console.error("Error refreshing credits:", error)
    }
  }

  // Show success toast with credit amount
  function showSuccessToast(packageId) {
    // This function could be enhanced to show a toast notification
    // For now, we just set the payment status which displays a message
    const packageDetails = getCreditPackageById(packageId)
    if (packageDetails) {
      console.log(
        `Purchase successful: ${packageDetails.credits} credits for $${packageDetails.price}`
      )
    }
  }

  const handlePhoneNumberChange = e => {
    setPhoneNumber(e.target.value)
  }

  const handleCall = () => {
    // This would initiate a call in a real implementation
    // For now, we'll just navigate to a call page
    if (phoneNumber) {
      window.location.href = `/call?number=${encodeURIComponent(phoneNumber)}`
    }
  }

  const handleBuyCredits = async packageId => {
    setIsLoading(true)
    try {
      if (!user) {
        setError("Please sign in to purchase credits")
        setIsLoading(false)
        return
      }

      const packageDetails = getCreditPackageById(packageId)
      if (!packageDetails) {
        setError("Invalid credit package")
        setIsLoading(false)
        return
      }

      // Create checkout session
      const { sessionId, url, error } = await createCheckoutSession(
        packageId,
        user.id
      )

      if (error) {
        setError(error)
        setIsLoading(false)
        return
      }

      // Redirect to checkout URL
      window.location.href = url
    } catch (error) {
      console.error("Error purchasing credits:", error)
      setError("Failed to process your purchase")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className={styles.gradientText}>Minute</span>Caller
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-sm flex items-center">
              <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              <span className="text-gray-700 dark:text-gray-300 mr-1">
                Credits:
              </span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {credits}
              </span>
            </div>

            <Link
              href="/auth/signout"
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-14 h-14 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin mb-5"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading your dashboard...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg mx-auto text-center shadow-lg">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
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
            </div>
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md inline-block">
              Sign In Again
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, <span className="font-medium">{user?.email}</span>
              </p>
            </div>

            {/* Payment success message */}
            {paymentStatus === "success" && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-100 dark:border-green-800 text-green-800 dark:text-green-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-800 rounded-full p-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Payment successful! Your credits have been added to your
                      account.
                    </p>
                    {searchParams.get("package") && (
                      <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                        Package:{" "}
                        {getCreditPackageById(searchParams.get("package"))
                          ?.name || "Credit Package"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment canceled message */}
            {paymentStatus === "canceled" && (
              <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-800 rounded-full p-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold">
                    Payment was canceled. No credits were added to your account.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("dial")}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === "dial"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}>
                  <PhoneCall className="h-4 w-4" />
                  <span>Dial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("rates")}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === "rates"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}>
                  <DollarSign className="h-4 w-4" />
                  <span>Rates</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === "history"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}>
                  <History className="h-4 w-4" />
                  <span>Call History</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("credits")}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === "credits"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}>
                  <CreditCard className="h-4 w-4" />
                  <span>Buy Credits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("account")}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === "account"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}>
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </button>
              </div>

              <div className="p-6 md:p-8">
                {activeTab === "dial" && (
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        placeholder="Enter international number (e.g. +44123456789)"
                        className="w-full p-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6 text-center">
                      <p className="text-indigo-800 dark:text-indigo-200 font-medium mb-1">
                        Available Credits:{" "}
                        <span className="font-semibold text-lg">{credits}</span>
                      </p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">
                        Rates from 1 credit per minute
                      </p>
                    </div>

                    <button
                      onClick={handleCall}
                      type="button"
                      disabled={!phoneNumber || credits <= 0}
                      className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center ${styles.buttonGradient} text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400`}>
                      <PhoneCall className="h-5 w-5 mr-2" />
                      Start Call
                    </button>

                    {credits <= 0 && (
                      <div className="text-center mt-5 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                        <p className="text-red-600 dark:text-red-300">
                          You need credits to make calls.{" "}
                          <button
                            type="button"
                            onClick={() => setActiveTab("credits")}
                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline focus:outline-none">
                            Buy credits
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "rates" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        International Call Rates
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {credits}
                        </span>{" "}
                        credits available
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <CountryRateCalculator
                          maxResults={10}
                          showAllRatesLink={false}
                        />
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/30">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                          About Our Rates
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                              How credits work
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Credits are deducted from your account based on
                              the per-minute rate for each country. For example,
                              calling the UK costs 1.2 credits per minute.
                            </p>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Billing increments
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Calls are billed in 60-second increments. Partial
                              minutes are rounded up to the next full minute.
                            </p>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Credit expiration
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Your credits never expire and can be used at any
                              time.
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => setActiveTab("credits")}
                            className={`${styles.buttonGradient} text-white py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all w-full`}>
                            Buy More Credits
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Your Call History
                      </h3>
                      <button
                        onClick={loadUserData}
                        className="px-3 py-1.5 text-sm bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-md flex items-center gap-1.5 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                          <path d="M21 3v5h-5"></path>
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                          <path d="M8 16H3v5"></path>
                        </svg>
                        Refresh
                      </button>
                    </div>

                    {callHistory.length === 0 ? (
                      <div className="text-center py-12 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-30 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          You haven&apos;t made any calls yet.
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Your call history will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Number
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date & Time
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Duration
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cost
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                            {callHistory.map(call => (
                              <tr
                                key={call.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                                  {formatPhoneNumber(call.phone_number)}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                  {formatDate(call.created_at)}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                  {formatDuration(call.duration)}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                  <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {call.cost}
                                  </span>{" "}
                                  credits
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "credits" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        Buy Credits
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Choose a credit package below to make international
                        calls at competitive rates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div
                        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 ${styles.cardHover} ${styles.panelShadow}`}>
                        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                          Basic Package
                        </h4>
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            $5
                          </span>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-1.5 inline-block mb-4">
                          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                            50 Credits
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 min-h-[40px]">
                          Perfect for occasional international callers
                        </p>
                        <button
                          type="button"
                          onClick={() => handleBuyCredits("basic")}
                          className={`w-full ${styles.buttonGradient} text-white py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all`}>
                          Buy Now
                        </button>
                      </div>

                      <div
                        className={`bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-xl p-5 relative overflow-hidden ${styles.cardHover} ${styles.panelShadow}`}>
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold px-3 py-1">
                          Popular
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                          Standard Package
                        </h4>
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            $10
                          </span>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-1.5 inline-block mb-4">
                          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                            120 Credits
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 min-h-[40px]">
                          Great value for regular international callers
                        </p>
                        <button
                          onClick={() => handleBuyCredits("standard")}
                          className={`w-full ${styles.buttonGradient} text-white py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all`}>
                          Buy Now
                        </button>
                      </div>

                      <div
                        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 ${styles.cardHover} ${styles.panelShadow}`}>
                        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                          Premium Package
                        </h4>
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            $20
                          </span>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-1.5 inline-block mb-4">
                          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                            280 Credits
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 min-h-[40px]">
                          Best value for frequent international callers
                        </p>
                        <button
                          onClick={() => handleBuyCredits("premium")}
                          className={`w-full ${styles.buttonGradient} text-white py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all`}>
                          Buy Now
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                        About Our Credits
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Credits are used to make calls to international
                        destinations. Different countries have different rates
                        based on local telecom charges.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        All packages are one-time purchases (no subscription).
                        Credits never expire and can be used anytime.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "account" && (
                  <div className="max-w-lg">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                      Account Settings
                    </h3>

                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Email
                        </h4>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {user?.email}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Account Created
                        </h4>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {user?.created_at
                            ? formatDate(user.created_at)
                            : "N/A"}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                          Security
                        </h4>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

// Main component that wraps the content in a Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
