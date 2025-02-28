import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  console.log("[Auth Test] Testing Supabase connection")

  try {
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
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      }
    )

    console.log("[Auth Test] Created Supabase client")

    // Test the connection by getting the session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("[Auth Test] Error getting session:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to get session",
          error: error.message,
        },
        { status: 500 }
      )
    }

    console.log("[Auth Test] Session data:", data)

    // Check Supabase URL and key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return NextResponse.json({
      status: "success",
      message: "Supabase connection test",
      hasSession: !!data.session,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
    })
  } catch (error) {
    console.error("[Auth Test] Exception in auth test:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Exception in auth test",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
