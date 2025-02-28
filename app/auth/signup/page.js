"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PhoneCall, Loader } from "lucide-react"
import { signUp } from "@/app/lib/supabase"

// Custom styles that match our dashboard
const styles = {
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  gradientBg: "bg-gradient-to-r from-indigo-600 to-violet-600",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  panelShadow: "shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20",
  inputFocus:
    "focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500",
}

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate password
      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      // Call our custom signUp function
      const { data, error: signUpError } = await signUp({ email, password })

      if (signUpError) {
        console.error("Sign up error:", signUpError)
        setError(signUpError.message || "Failed to sign up. Please try again.")
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // Sign up successful, show confirmation message
        setSuccess(true)
        setIsLoading(false)

        // Optionally redirect after a delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError("Something went wrong. Please try again.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Exception during sign up:", err)
      setError("An unexpected error occurred. Please try again.")
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
              <span className={styles.gradientText}>Global</span>Dial
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">
              <span className={styles.gradientText}>Create</span> an Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up to start making international calls at competitive rates.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            {success ? (
              <div className="text-center py-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
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
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Account Created!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your account has been created successfully. Redirecting you to
                  the dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 text-sm mb-5 border border-red-100 dark:border-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ${styles.inputFocus}`}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Create a password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ${styles.inputFocus}`}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-medium text-white ${styles.buttonGradient} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all disabled:opacity-70`}>
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>

                <div className="text-center mt-5">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      href="/auth/signin"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            <p>By signing up, you agree to our</p>
            <div className="mt-1 space-x-3">
              <Link
                href="/terms"
                className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="/privacy"
                className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} MinuteCaller. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
