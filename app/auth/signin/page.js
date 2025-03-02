"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PhoneCall, Loader } from "lucide-react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClient } from "@/app/lib/supabase"

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

// Loading component to display while suspense is active
function SignInLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading sign in page...
        </p>
      </div>
    </div>
  )
}

// Component that uses useSearchParams
function SignInContent() {
  const [error, setError] = useState(null)
  const [supabase] = useState(() => createClient())
  const [redirectUrl, setRedirectUrl] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the next parameter if it exists
    const next = searchParams.get("next") || "/dashboard"

    // Set the redirect URL once we're in the browser
    setRedirectUrl(
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    )

    // Check for error in URL params (from callback)
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          console.log(
            "[SignIn Page] User already logged in, redirecting to dashboard"
          )
          // Use a small delay to ensure cookies are properly set
          setTimeout(() => {
            window.location.href = next
          }, 100)
        }
      } catch (error) {
        console.error("[SignIn Page] Error checking session:", error)
      }
    }

    checkUser()

    // Set up auth state change listener for redirection after sign-in
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[SignIn Page] Auth state changed: ${event}`, session)
      if (event === "SIGNED_IN" && session) {
        console.log("[SignIn Page] User signed in, redirecting to dashboard")
        // Use a small delay to ensure cookies are properly set
        setTimeout(() => {
          window.location.href = next
        }, 100)
      }
    })

    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [searchParams, supabase.auth])

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
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-6">
              <span className={styles.gradientText}>Welcome</span> to
              MinuteCaller
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to make international calls at competitive rates.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 text-sm mb-5 border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            {redirectUrl && (
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "#6366f1", // indigo-500
                        brandAccent: "#4f46e5", // indigo-600
                        brandButtonText: "#ffffff",
                        brandButtonBackground: "#6366f1",
                        brandButtonTextHover: "#ffffff",
                        brandButtonBackgroundHover: "#4f46e5",
                        inputText: "#ffffff",
                        inputBorder: "#6366f1",
                        inputBorderHover: "#4f46e5",
                        inputBorderFocus: "#4f46e5",
                        inputBorderError: "#ef4444",
                      },
                      borderRadii: {
                        button: "0.75rem", // rounded-xl
                        input: "0.75rem",
                      },
                    },
                  },
                }}
                providers={[]}
                redirectTo={redirectUrl}
                onlyThirdPartyProviders={false}
              />
            )}
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            <p>By signing in, you agree to our</p>
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

// Main component that wraps the content in a Suspense boundary
export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  )
}
