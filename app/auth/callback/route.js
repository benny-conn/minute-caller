import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// This route is called by Supabase Auth after a user completes the sign-in flow
export async function GET(request) {
  console.log("[Auth Callback] Auth callback route called")
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  console.log(`[Auth Callback] Code present: ${!!code}`)
  console.log(`[Auth Callback] Next URL: ${next}`)

  // Log all cookies for debugging
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  console.log(
    `[Auth Callback] Cookies present:`,
    allCookies
      .map(c => `${c.name}: ${c.value ? "present" : "empty"}`)
      .join(", ")
  )

  if (!code) {
    console.log("[Auth Callback] No code provided, redirecting to sign-in")
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  try {
    // Create a response object that we'll use for redirection
    const response = NextResponse.redirect(new URL(next, request.url))

    // Create a Supabase client for the server
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            const cookie = cookieStore.get(name)
            console.log(
              `[Auth Callback] Getting cookie: ${name}, exists: ${!!cookie}`
            )
            return cookie?.value
          },
          set(name, value, options) {
            // Set cookies with appropriate options for better persistence
            console.log(
              `[Auth Callback] Setting cookie: ${name}, value length: ${
                value?.length || 0
              }`
            )

            // Define cookie options with secure attributes
            const cookieOptions = {
              ...options,
              // Set a long max age for persistent cookies (7 days)
              maxAge: 60 * 60 * 24 * 7,
              // Ensure cookies are accessible across the site
              path: "/",
              // Use lax same-site policy to balance security and functionality
              sameSite: "lax",
              // Use secure cookies in production
              secure: process.env.NODE_ENV === "production",
              // Make sure cookies are accessible via JavaScript
              httpOnly: false,
            }

            console.log(
              `[Auth Callback] Cookie options:`,
              JSON.stringify(cookieOptions)
            )

            // Set the cookie in both the cookie store and the response
            cookieStore.set(name, value, cookieOptions)
            response.cookies.set(name, value, cookieOptions)

            console.log(`[Auth Callback] Cookie set: ${name}`)
          },
          remove(name, options) {
            console.log(`[Auth Callback] Removing cookie: ${name}`)
            cookieStore.set(name, "", { ...options, maxAge: 0 })
            response.cookies.set(name, "", { ...options, maxAge: 0 })
          },
        },
      }
    )

    console.log("[Auth Callback] Created Supabase client")

    // Exchange the code for a session
    console.log("[Auth Callback] Exchanging code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[Auth Callback] Error exchanging code for session:", error)
      return NextResponse.redirect(
        new URL(
          `/auth/signin?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      )
    }

    console.log("[Auth Callback] Successfully exchanged code for session")
    console.log(`[Auth Callback] User: ${data?.user?.email}`)
    console.log(
      `[Auth Callback] Session expires at: ${new Date(
        data?.session?.expires_at * 1000
      ).toISOString()}`
    )
    console.log(`[Auth Callback] Redirecting to: ${next}`)

    // Set comprehensive cache control headers to prevent caching
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    // Log all cookies after setting session
    console.log(
      `[Auth Callback] Response cookies:`,
      Array.from(response.cookies.getAll())
        .map(c => `${c.name}: ${c.value ? "present" : "empty"}`)
        .join(", ")
    )

    return response
  } catch (error) {
    console.error("[Auth Callback] Exception in auth callback:", error)
    return NextResponse.redirect(
      new URL(
        `/auth/signin?error=${encodeURIComponent("Authentication failed")}`,
        request.url
      )
    )
  }
}
