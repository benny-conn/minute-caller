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

      // Ensure cookies are properly set by getting the session
      try {
        console.log(`[Auth] Verifying session after sign in`)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) {
          console.error(
            `[Auth] Error getting session after sign in:`,
            sessionError
          )
        } else if (!sessionData?.session) {
          console.error(`[Auth] No session found after sign in`)
        } else {
          console.log(`[Auth] Session verified after sign in`)
        }
      } catch (sessionErr) {
        console.error(`[Auth] Exception verifying session:`, sessionErr)
      }
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
    const userId = "dev-user-123"

    // Add 5 initial credits for development mode
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`credits_${userId}`, "5")
      } catch (e) {
        console.log("Could not access localStorage")
      }
    }

    return {
      data: {
        user: {
          id: userId,
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

  // If signup was successful, add 5 initial credits to the user
  if (data?.user?.id && !error) {
    try {
      // Create a credits record with 5 initial credits
      const { error: creditsError } = await supabase.from("credits").insert({
        user_id: data.user.id,
        amount: 5, // 5 initial credits
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (creditsError) {
        console.error("Error adding initial credits:", creditsError)
      } else {
        console.log("Successfully added 5 initial credits for new user")

        // Record the transaction
        try {
          await supabase.from("transactions").insert({
            user_id: data.user.id,
            amount: 5,
            type: "bonus",
            status: "completed",
            metadata: {
              source: "signup_bonus",
              description: "Initial signup bonus credits",
            },
            created_at: new Date().toISOString(),
          })
        } catch (txError) {
          console.log(
            "Error recording initial credits transaction (non-critical):",
            txError
          )
        }
      }
    } catch (e) {
      console.error("Exception adding initial credits:", e)
    }
  }

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

  try {
    console.log("[Auth] Getting current user with supabase.auth.getUser()")
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("[Auth] Error getting user:", error.message)

      // Try to get the session as a fallback
      console.log("[Auth] Trying to get session as fallback")
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) {
          console.error("[Auth] Error getting session:", sessionError.message)
          return { user: null, error }
        }

        if (sessionData?.session?.user) {
          console.log(
            "[Auth] Found user in session:",
            sessionData.session.user.email
          )
          return { user: sessionData.session.user, error: null }
        }
      } catch (sessionErr) {
        console.error("[Auth] Exception getting session:", sessionErr)
      }

      // If we still don't have a user, try to refresh the session
      console.log("[Auth] Trying to refresh session")
      try {
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession()

        if (refreshError) {
          console.error(
            "[Auth] Error refreshing session:",
            refreshError.message
          )
          return { user: null, error }
        }

        if (refreshData?.session?.user) {
          console.log(
            "[Auth] Found user after refresh:",
            refreshData.session.user.email
          )
          return { user: refreshData.session.user, error: null }
        }
      } catch (refreshErr) {
        console.error("[Auth] Exception refreshing session:", refreshErr)
      }

      return { user: null, error }
    }

    if (!data?.user) {
      console.log("[Auth] No user found in getUser response")
      return { user: null, error: new Error("No user found") }
    }

    console.log("[Auth] User retrieved successfully:", data.user.email)
    return { user: data.user, error: null }
  } catch (e) {
    console.error("[Auth] Exception in getCurrentUser:", e)
    return { user: null, error: e }
  }
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
      console.error("updateUserCredits: User ID is required")
      return { success: false, error: "User ID is required" }
    }

    // Validate newAmount is a number
    if (typeof newAmount !== "number" || isNaN(newAmount)) {
      console.error("updateUserCredits: Invalid credit amount:", newAmount)
      return { success: false, error: "Credit amount must be a valid number" }
    }

    // Ensure newAmount is not negative
    const validAmount = Math.max(0, newAmount)

    console.log(`Updating credits for user ${userId} to ${validAmount}`)

    // For development mode with no Supabase credentials
    if (isDevelopmentWithNoSupabase) {
      console.log(`[DEV] Updated credits for user ${userId} to ${validAmount}`)

      // In true development with no Supabase, we'll use localStorage if available
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`credits_${userId}`, validAmount.toString())
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
        .select("id, amount")
        .eq("user_id", userId)
        .single()

      // Handle table doesn't exist error
      if (checkError && checkError.message.includes("does not exist")) {
        console.log("Credits table does not exist - trying to create it")

        // Try to create credits table using SQL - note: this requires admin privileges
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
          amount: validAmount,
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
      let previousAmount = 0

      if (existingRecord) {
        // Store previous amount for transaction record
        previousAmount = existingRecord.amount || 0

        // Update existing record
        const { error: updateError } = await supabase
          .from("credits")
          .update({ amount: validAmount, updated_at: new Date().toISOString() })
          .eq("user_id", userId)

        error = updateError
      } else {
        // Create new record
        const { error: insertError } = await supabase.from("credits").insert({
          user_id: userId,
          amount: validAmount,
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
            amount: validAmount,
            type: "update",
            status: "completed",
            metadata: {
              previous_balance: previousAmount,
              new_balance: validAmount,
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
  // Validate required fields
  if (!callData || !callData.user_id || !callData.phone_number) {
    console.error("Missing required fields for call history:", callData)
    return {
      data: null,
      error: "Missing required fields for call history",
    }
  }

  // For development mode or when Supabase is not configured
  if (isDevelopmentWithNoSupabase) {
    console.log("[DEV] Call history saved:", callData)
    return {
      data: [{ id: "mock-call-" + Date.now(), ...callData }],
      error: null,
    }
  }

  try {
    // First check if the table exists
    const { error: tableCheckError } = await supabase
      .from("call_history")
      .select("id")
      .limit(1)

    // Handle table doesn't exist error
    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.log("Call history table does not exist - attempting to create it")

      try {
        // Try to create call_history table using SQL - requires admin privileges
        const { error: createTableError } = await supabase.rpc(
          "create_call_history_table"
        )

        if (createTableError) {
          console.error(
            "Could not create call_history table:",
            createTableError
          )
          return {
            data: null,
            error: "Database not properly set up for call history",
          }
        }
      } catch (e) {
        console.error("Exception creating call_history table:", e)
      }
    }

    // Now insert the call history record
    const { data, error } = await supabase
      .from("call_history")
      .insert([callData])
      .select()

    if (error) {
      console.error("Error inserting call history:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error saving call history:", error)
    return { data: null, error: "Failed to save call history" }
  }
}

export const getUserCallHistory = async userId => {
  console.log("getUserCallHistory called for user:", userId)

  // For development mode or when Supabase is not configured
  if (isDevelopmentWithNoSupabase) {
    console.log("[DEV] Returning mock call history for user:", userId)
    const mockData = mockCallHistory(userId)
    console.log("Mock call history data:", mockData)
    return mockData
  }

  try {
    console.log("Fetching call history from Supabase for user:", userId)
    const { data, error } = await supabase
      .from("call_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Handle table doesn't exist error
    if (error && error.message.includes("does not exist")) {
      console.log("Call history table does not exist yet - using mock data")
      const mockData = mockCallHistory(userId)
      console.log("Mock call history data (table doesn't exist):", mockData)
      return mockData
    }

    if (error) {
      console.error("Error fetching call history:", error)
      // In development, return mock data instead of error
      if (process.env.NODE_ENV === "development") {
        const mockData = mockCallHistory(userId)
        console.log("Mock call history data (after error):", mockData)
        return mockData
      }
      return { calls: [], error }
    }

    console.log("Call history data from Supabase:", data)
    // Make sure we're returning properly structured data
    return { calls: data || [], error: null }
  } catch (error) {
    console.error("Exception in getUserCallHistory:", error)
    // In development, don't break the app
    if (process.env.NODE_ENV === "development") {
      const mockData = mockCallHistory(userId)
      console.log("Mock call history data (after exception):", mockData)
      return mockData
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
