import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  // Create a Supabase client for the server
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        async set(name, value, options) {
          await cookieStore.set({ name, value, ...options })
        },
        async remove(name, options) {
          await cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )

  // Sign out the user
  await supabase.auth.signOut()

  console.log("Signed out user", request.url)

  // Clear cookies by setting a new response with cleared cookies
  const response = NextResponse.redirect(new URL("/", request.url))

  // Set cookie expiry to a past date to ensure they're cleared
  response.cookies.set("supabase-auth-token", "", {
    expires: new Date(0),
    path: "/",
  })

  // Also clear the sb-* cookies that Supabase uses
  response.cookies.set("sb-access-token", "", {
    expires: new Date(0),
    path: "/",
  })

  response.cookies.set("sb-refresh-token", "", {
    expires: new Date(0),
    path: "/",
  })

  return response
}
