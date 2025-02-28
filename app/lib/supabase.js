import { createBrowserClient } from "@supabase/ssr"

// Initialize Supabase client with environment variables
// In production, these would be set in your environment
// For local development, you'd use .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we're in development mode with no Supabase credentials
const isDevelopmentWithNoSupabase =
  process.env.NODE_ENV === "development" && (!supabaseUrl || !supabaseAnonKey)

// Create and export the Supabase client for browser usage
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Create a singleton instance for direct imports
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// User management functions
export const signIn = async ({ email, password }) => {
  console.log(`[Auth] Attempting to sign in user: ${email}`)
  console.log(
    `[Auth] isDevelopmentWithNoSupabase: ${isDevelopmentWithNoSupabase}`
  )
  console.log(`[Auth] supabaseUrl exists: ${!!supabaseUrl}`)
  console.log(`[Auth] supabaseAnonKey exists: ${!!supabaseAnonKey}`)

  if (isDevelopmentWithNoSupabase) {
    console.log(`[Auth] Using mock data for development`)
    // Return mock data for development
    return {
      data: {
        user: {
          id: "dev-user-123",
          email: email || "dev@example.com",
          created_at: new Date().toISOString(),
        },
      },
      error: null,
    }
  }

  try {
    console.log(`[Auth] Calling supabase.auth.signInWithPassword`)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(`[Auth] Sign in error:`, error)
    } else {
      console.log(`[Auth] Sign in successful for user: ${data?.user?.email}`)
    }

    return { data, error }
  } catch (e) {
    console.error(`[Auth] Exception during sign in:`, e)
    return { data: null, error: e }
  }
}

export const signUp = async ({ email, password }) => {
  if (isDevelopmentWithNoSupabase) {
    // Return mock data for development
    return {
      data: {
        user: {
          id: "dev-user-123",
          email: email || "dev@example.com",
          created_at: new Date().toISOString(),
        },
      },
      error: null,
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  return { data, error }
}

export const signOut = async () => {
  if (isDevelopmentWithNoSupabase) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (isDevelopmentWithNoSupabase) {
    // Return mock user for development
    return {
      user: {
        id: "dev-user-123",
        email: "dev@example.com",
        created_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user, error }
}

// Credit management functions
export async function getUserCredits(userId) {
  try {
    if (!userId) {
      return { credits: 0, error: "User ID is required" }
    }

    // For development mode with no Supabase credentials
    if (isDevelopmentWithNoSupabase) {
      console.log("[DEV] Returning mock credits for user:", userId)

      // In true development with no Supabase, we'll use localStorage if available
      if (typeof window !== "undefined") {
        try {
          const storedCredits = localStorage.getItem(`credits_${userId}`)
          if (storedCredits !== null) {
            return { credits: parseFloat(storedCredits), error: null }
          }
        } catch (e) {
          console.log("Could not access localStorage")
        }
      }

      return { credits: 0, error: null }
    }

    // In real environment with Supabase
    try {
      const { data, error } = await supabase
        .from("credits")
        .select("amount")
        .eq("user_id", userId)
        .single()

      if (error) {
        // If no record found or table doesn't exist
        if (
          error.code === "PGRST116" ||
          error.message.includes("does not exist")
        ) {
          console.log(
            "Credits table not found or no record for user - initializing with 0 credits"
          )

          // Try to create the credits record with 0
          try {
            const { error: insertError } = await supabase
              .from("credits")
              .insert({
                user_id: userId,
                amount: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

            if (!insertError) {
              console.log("Created new credits record with 0 balance")
            }
          } catch (insertErr) {
            console.error("Could not create credits record:", insertErr)
          }

          return { credits: 0, error: null }
        }

        console.error("Database error fetching credits:", error)
        return { credits: 0, error: error.message }
      }

      return { credits: data?.amount || 0, error: null }
    } catch (dbError) {
      console.error("Exception when fetching credits:", dbError)
      return { credits: 0, error: "Failed to fetch credits" }
    }
  } catch (error) {
    console.error("Error in getUserCredits:", error)
    return { credits: 0, error: "Failed to fetch credits" }
  }
}

export async function updateUserCredits(userId, newAmount) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // For development mode with no Supabase credentials
    if (isDevelopmentWithNoSupabase) {
      console.log(`[DEV] Updated credits for user ${userId} to ${newAmount}`)

      // In true development with no Supabase, we'll use localStorage if available
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`credits_${userId}`, newAmount.toString())
        } catch (e) {
          console.log("Could not access localStorage")
        }
      }

      return { success: true, error: null }
    }

    try {
      // Check if user has a credit record
      const { data: existingRecord, error: checkError } = await supabase
        .from("credits")
        .select("id")
        .eq("user_id", userId)
        .single()

      // Handle table doesn't exist error
      if (checkError && checkError.message.includes("does not exist")) {
        console.log("Credits table does not exist - trying to create it")

        // Try to create credits table using SQL - note: this requires admin privileges
        // In a real app, you'd pre-create this table in a migration
        try {
          const { error: createTableError } = await supabase.rpc(
            "create_credits_table"
          )
          if (createTableError) {
            console.error("Could not create credits table:", createTableError)
            return { success: false, error: "Database not properly set up" }
          }
        } catch (e) {
          console.error("Exception creating table:", e)
        }

        // Try to insert after table creation
        const { error: insertError } = await supabase.from("credits").insert({
          user_id: userId,
          amount: newAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error inserting initial credits:", insertError)
          return { success: false, error: insertError.message }
        }

        return { success: true, error: null }
      }

      let error

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("credits")
          .update({ amount: newAmount, updated_at: new Date().toISOString() })
          .eq("user_id", userId)

        error = updateError
      } else {
        // Create new record
        const { error: insertError } = await supabase.from("credits").insert({
          user_id: userId,
          amount: newAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        error = insertError
      }

      if (error) {
        console.error("Error updating credits:", error)
        return { success: false, error: error.message }
      }

      // Try to record transaction
      try {
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert({
            user_id: userId,
            amount: newAmount,
            type: "purchase",
            status: "completed",
            metadata: {
              previous_balance: existingRecord ? existingRecord.amount : 0,
              new_balance: newAmount,
              source: "credit_update",
            },
            created_at: new Date().toISOString(),
          })

        if (transactionError) {
          // Don't fail the overall operation if just the transaction record fails
          console.log(
            "Error recording transaction (non-critical):",
            transactionError
          )
        }
      } catch (transactionException) {
        console.log(
          "Exception recording transaction (non-critical):",
          transactionException
        )
      }

      return { success: true, error: null }
    } catch (dbError) {
      console.error("Database exception in updateUserCredits:", dbError)
      return { success: false, error: "Database error updating credits" }
    }
  } catch (error) {
    console.error("Error in updateUserCredits:", error)
    return { success: false, error: "Failed to update credits" }
  }
}

// Call history functions
export const saveCallHistory = async callData => {
  // For development mode or when Supabase is not configured
  if (isDevelopmentWithNoSupabase || process.env.NODE_ENV === "development") {
    console.log("[DEV] Call history saved:", callData)
    return {
      data: [{ id: "mock-call-" + Date.now(), ...callData }],
      error: null,
    }
  }

  try {
    const { data, error } = await supabase
      .from("call_history")
      .insert([callData])
      .select()

    // Handle table doesn't exist error
    if (error && error.message.includes("does not exist")) {
      console.log("Call history table does not exist yet")
      return {
        data: [{ id: "mock-call-" + Date.now(), ...callData }],
        error: null,
      }
    }

    return { data, error }
  } catch (error) {
    console.error("Error saving call history:", error)
    // In development, don't break the app
    if (process.env.NODE_ENV === "development") {
      return {
        data: [{ id: "mock-call-" + Date.now(), ...callData }],
        error: null,
      }
    }
    return { data: null, error: "Failed to save call history" }
  }
}

export const getUserCallHistory = async userId => {
  // For development mode or when Supabase is not configured
  if (isDevelopmentWithNoSupabase) {
    console.log("[DEV] Returning mock call history for user:", userId)
    return mockCallHistory(userId)
  }

  try {
    const { data, error } = await supabase
      .from("call_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Handle table doesn't exist error
    if (error && error.message.includes("does not exist")) {
      console.log("Call history table does not exist yet - using mock data")
      return mockCallHistory(userId)
    }

    if (error) {
      console.error("Error fetching call history:", error)
      // In development, return mock data instead of error
      if (process.env.NODE_ENV === "development") {
        return mockCallHistory(userId)
      }
      return { calls: [], error }
    }

    // Make sure we're returning properly structured data
    return { calls: data || [], error: null }
  } catch (error) {
    console.error("Exception in getUserCallHistory:", error)
    // In development, don't break the app
    if (process.env.NODE_ENV === "development") {
      return mockCallHistory(userId)
    }
    return { calls: [], error: "Failed to fetch call history" }
  }
}

// Helper function to generate mock call history
function mockCallHistory(userId) {
  // Return mock call history data with realistic-looking values
  return {
    calls: [
      {
        id: "mock-call-1",
        user_id: userId,
        phone_number: "+441234567890",
        duration: 120, // 2 minutes
        cost: 3,
        status: "completed",
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: "mock-call-2",
        user_id: userId,
        phone_number: "+14155552671",
        duration: 300, // 5 minutes
        cost: 5,
        status: "completed",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: "mock-call-3",
        user_id: userId,
        phone_number: "+3197010280866",
        duration: 75, // 1:15 minutes
        cost: 2.5,
        status: "completed",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ],
    error: null,
  }
}
