import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

// This middleware runs on every request
export async function middleware(request) {
  console.log(
    `[Middleware] Processing request for: ${request.nextUrl.pathname}`
  )

  // Skip middleware processing for the sign-in page to prevent loops
  if (request.nextUrl.pathname === "/auth/signin") {
    console.log(`[Middleware] Skipping middleware for sign-in page`)
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
        get: name => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name, options) => {
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log(
      `[Middleware] Session check result: ${
        session ? "Session exists" : "No session"
      }`
    )

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

    // Set cache control headers to prevent caching for authenticated routes
    if (session) {
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
      )
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
    }

    console.log(`[Middleware] Allowing access to ${request.nextUrl.pathname}`)
    return response
  } catch (error) {
    console.error(`[Middleware] Error checking session:`, error)

    // If there's an error checking the session on a protected route, redirect to sign-in
    const isProtectedRoute = ["/dashboard", "/call"].some(route =>
      request.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute) {
      console.log(
        `[Middleware] Error occurred on protected route, redirecting to sign-in`
      )
      const redirectUrl = new URL(`/auth/signin`, request.url)
      return NextResponse.redirect(redirectUrl)
    }

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
