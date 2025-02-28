import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

// This middleware runs on every request
export async function middleware(request) {
  console.log(
    `[Middleware] Processing request for: ${request.nextUrl.pathname}`
  )

  // Log all cookies for debugging
  console.log(
    `[Middleware] Cookies present:`,
    Array.from(request.cookies.getAll())
      .map(c => `${c.name}: ${c.value ? "present" : "empty"}`)
      .join(", ")
  )

  // Skip middleware processing for the sign-in page to prevent loops
  if (request.nextUrl.pathname === "/auth/signin") {
    console.log(`[Middleware] Skipping middleware for sign-in page`)
    return NextResponse.next()
  }

  // Skip middleware for auth callback to prevent interference with the auth flow
  if (request.nextUrl.pathname === "/auth/callback") {
    console.log(`[Middleware] Skipping middleware for auth callback`)
    return NextResponse.next()
  }

  // Skip middleware for debug page to allow access even when not authenticated
  if (request.nextUrl.pathname === "/auth/debug") {
    console.log(`[Middleware] Skipping middleware for debug page`)
    return NextResponse.next()
  }

  // Skip middleware for static assets and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.includes("favicon.ico")
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: name => {
          const cookie = request.cookies.get(name)
          console.log(
            `[Middleware] Getting cookie: ${name}, exists: ${!!cookie}`
          )
          return cookie?.value
        },
        set: (name, value, options) => {
          console.log(
            `[Middleware] Setting cookie: ${name}, value length: ${
              value?.length || 0
            }`
          )
          // Set cookies with appropriate options for better persistence
          response.cookies.set({
            name,
            value,
            ...options,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            // Set a long max age for persistent cookies (7 days)
            maxAge: 60 * 60 * 24 * 7,
          })
        },
        remove: (name, options) => {
          console.log(`[Middleware] Removing cookie: ${name}`)
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  try {
    console.log(`[Middleware] Attempting to get session...`)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log(
      `[Middleware] Session check result: ${
        session ? `Session exists for ${session.user.email}` : "No session"
      }`
    )

    if (session) {
      console.log(
        `[Middleware] Session expires at: ${new Date(
          session.expires_at * 1000
        ).toISOString()}`
      )
      console.log(`[Middleware] Current time: ${new Date().toISOString()}`)

      // Check if session is about to expire and refresh it
      const expiresAt = session.expires_at * 1000 // convert to milliseconds
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now

      console.log(
        `[Middleware] Time until session expiry: ${Math.floor(
          timeUntilExpiry / 1000 / 60
        )} minutes`
      )

      // If session expires in less than 10 minutes, refresh it
      if (timeUntilExpiry < 10 * 60 * 1000) {
        console.log(`[Middleware] Session expiring soon, refreshing...`)
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession()

        if (refreshError) {
          console.error(`[Middleware] Error refreshing session:`, refreshError)
        } else {
          console.log(`[Middleware] Session refreshed successfully`)
        }
      }
    }

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/call"]
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    )

    console.log(`[Middleware] Is protected route: ${isProtectedRoute}`)

    // If accessing a protected route without a session, redirect to the login page
    if (isProtectedRoute && !session) {
      console.log(
        `[Middleware] Redirecting to sign-in page from ${request.nextUrl.pathname}`
      )
      // Include the original URL as the next parameter
      const originalPath = request.nextUrl.pathname
      const searchParams = request.nextUrl.searchParams.toString()
      const fullPath = searchParams
        ? `${originalPath}?${searchParams}`
        : originalPath

      const redirectUrl = new URL(
        `/auth/signin?next=${encodeURIComponent(fullPath)}`,
        request.url
      )

      // Set cache control headers to prevent caching
      const redirectResponse = NextResponse.redirect(redirectUrl)
      redirectResponse.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
      )
      redirectResponse.headers.set("Pragma", "no-cache")
      redirectResponse.headers.set("Expires", "0")

      return redirectResponse
    }

    // Set cache control headers to prevent caching of authenticated pages
    if (session) {
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
      )
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
    }

    return response
  } catch (error) {
    console.error(`[Middleware] Error in middleware:`, error)
    return response
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply this middleware to all routes except static files, api routes, and auth routes
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)",
  ],
}
