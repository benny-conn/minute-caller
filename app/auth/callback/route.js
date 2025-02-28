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
            return cookies().get(name)?.value
          },
          set(name, value, options) {
            cookies().set(name, value, options)
            response.cookies.set(name, value, options)
          },
          remove(name, options) {
            cookies().set(name, "", { ...options, maxAge: 0 })
            response.cookies.set(name, "", { ...options, maxAge: 0 })
          },
        },
      }
    )

    console.log("[Auth Callback] Created Supabase client")

    // Exchange the code for a session
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
    console.log(`[Auth Callback] Redirecting to: ${next}`)

    // Set cache control headers to prevent caching
    response.headers.set("Cache-Control", "no-store, max-age=0")

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
