import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/call", "/settings", "/profile"]

// This middleware runs on every request
export async function middleware(request) {
  console.log(
    `[Middleware] Processing request for: ${request.nextUrl.pathname}`
  )

  // Skip middleware processing for specific routes
  if (
    request.nextUrl.pathname === "/auth/signin" ||
    request.nextUrl.pathname === "/auth/callback" ||
    request.nextUrl.pathname.startsWith("/auth/debug") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.includes("favicon.ico")
  ) {
    console.log(`[Middleware] Skipping middleware for excluded path`)
    return NextResponse.next()
  }

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
    // First try to get the session
    console.log(`[Middleware] Checking session`)
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError) {
      console.log(`[Middleware] Session error: ${sessionError.message}`)

      // Try to get the user directly as a fallback
      console.log(`[Middleware] Trying to get user directly`)
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
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

      console.log(
        `[Middleware] User found despite session error: ${userData.user.email}`
      )
    } else if (!sessionData?.session) {
      console.log(`[Middleware] No session found, redirecting to sign-in`)

      // Redirect to sign-in page with the current URL as the next parameter
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set(
        "next",
        request.nextUrl.pathname + request.nextUrl.search
      )

      return NextResponse.redirect(redirectUrl)
    }

    // At this point we have either a valid session or a valid user
    const session = sessionData?.session
    const user = session?.user || (await supabase.auth.getUser()).data?.user

    if (!user) {
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
        try {
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession()

          if (!refreshError) {
            console.log(`[Middleware] Session refreshed successfully`)
          } else {
            console.log(
              `[Middleware] Failed to refresh session: ${refreshError.message}`
            )

            // If refresh fails but we still have a valid session, continue
            if (timeUntilExpiry > 0) {
              console.log(
                `[Middleware] Using existing session despite refresh failure`
              )
            }
          }
        } catch (refreshError) {
          console.error(
            `[Middleware] Error refreshing session: ${refreshError.message}`
          )
        }
      }
    } else {
      console.log(
        `[Middleware] No session to refresh, but user is authenticated`
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

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply this middleware to all routes except static files, api routes, and auth routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
