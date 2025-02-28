import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/call", "/settings", "/profile"]

export async function middleware(request) {
  console.log(
    `[Middleware] Processing request for: ${request.nextUrl.pathname}`
  )

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    console.log(`[Middleware] Not a protected route, skipping auth check`)
    return NextResponse.next()
  }

  console.log(`[Middleware] Protected route detected, checking auth`)

  // Log all cookies for debugging
  const allCookies = request.cookies.getAll()
  console.log(
    `[Middleware] Cookies present:`,
    allCookies
      .map(c => `${c.name}: ${c.value ? "present" : "empty"}`)
      .join(", ")
  )

  // Create a response object that we'll use if we need to modify headers
  let response = NextResponse.next()

  // Create a Supabase client for the server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          const cookie = request.cookies.get(name)
          console.log(
            `[Middleware] Getting cookie: ${name}, exists: ${!!cookie}`
          )
          return cookie?.value
        },
        set(name, value, options) {
          console.log(
            `[Middleware] Setting cookie: ${name}, value length: ${
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

          // Set the cookie in the response
          response.cookies.set(name, value, cookieOptions)
          console.log(`[Middleware] Cookie set: ${name}`)
        },
        remove(name, options) {
          console.log(`[Middleware] Removing cookie: ${name}`)
          response.cookies.set(name, "", { ...options, maxAge: 0 })
        },
      },
    }
  )

  try {
    // Get the session using getUser (more secure than getSession)
    console.log(`[Middleware] Checking authentication status`)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.log(
        `[Middleware] No authenticated user found, redirecting to sign-in`
      )

      // Redirect to sign-in page with the current URL as the next parameter
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set(
        "next",
        request.nextUrl.pathname + request.nextUrl.search
      )

      return NextResponse.redirect(redirectUrl)
    }

    console.log(`[Middleware] User authenticated: ${user.email}`)

    // Try to refresh the session if it's about to expire
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (session) {
        const expiresAt = session.expires_at * 1000 // Convert to milliseconds
        const now = Date.now()
        const timeUntilExpiry = expiresAt - now

        console.log(
          `[Middleware] Session expires in: ${Math.floor(
            timeUntilExpiry / 1000 / 60
          )} minutes`
        )

        // If session expires in less than 10 minutes, refresh it
        if (timeUntilExpiry < 10 * 60 * 1000) {
          console.log(`[Middleware] Session expiring soon, refreshing`)
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession()

          if (!refreshError) {
            console.log(`[Middleware] Session refreshed successfully`)
          } else {
            console.log(
              `[Middleware] Failed to refresh session: ${refreshError.message}`
            )
          }
        }
      }
    } catch (sessionError) {
      console.error(
        `[Middleware] Error checking session: ${sessionError.message}`
      )
    }

    // Set cache control headers to prevent caching of authenticated pages
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error(`[Middleware] Error in middleware: ${error.message}`)

    // In case of error, redirect to sign-in
    const redirectUrl = new URL("/auth/signin", request.url)
    redirectUrl.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search
    )
    redirectUrl.searchParams.set("error", "Session verification failed")

    return NextResponse.redirect(redirectUrl)
  }
}
