import { loadStripe } from "@stripe/stripe-js"
import Stripe from "stripe"

// Initialize Stripe API client (server-side)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", // Use the latest stable API version
})

// Initialize Stripe client for browser (client-side)
let stripePromise
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    )
  }
  return stripePromise
}

// Credit packages (price in cents)
export const CREDIT_PACKAGES = [
  {
    id: "basic",
    name: "Basic Package",
    credits: 50,
    price: 5.0,
    description: "Perfect for occasional callers",
  },
  {
    id: "standard",
    name: "Standard Package",
    credits: 120,
    price: 10.0,
    description: "Great value for regular callers",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Package",
    credits: 280,
    price: 20.0,
    description: "Best value for frequent callers",
  },
]

// Get credit package by ID
export function getCreditPackageById(packageId) {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId)
}

// Check if in development mode
const isDevelopment =
  process.env.NODE_ENV === "development" ||
  !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Create a checkout session
export async function createCheckoutSession(packageId, userId) {
  // Validate package ID
  const creditPackage = getCreditPackageById(packageId)
  if (!creditPackage) {
    return {
      sessionId: null,
      url: null,
      error: "Invalid credit package",
    }
  }

  try {
    // In development mode without Stripe keys, we'll create a mock session
    if (isDevelopment && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log("Creating mock checkout session for development")

      // Simulating a slight delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create a mock session ID
      const mockSessionId = `mock_${new Date().getTime()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`

      // Return a mock URL that points to the development success page with parameters
      return {
        sessionId: mockSessionId,
        url: `/dev/checkout-success?package=${creditPackage.id}&credits=${creditPackage.credits}`,
        error: null,
      }
    }

    // In production or with Stripe keys in development, make an actual API request
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packageId,
        userId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create checkout session")
    }

    const data = await response.json()
    return {
      sessionId: data.id,
      url: data.url,
      error: null,
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return {
      sessionId: null,
      url: null,
      error: error.message || "Failed to create checkout session",
    }
  }
}

// Function to handle successful payment webhook
export const handleSuccessfulPayment = async session => {
  try {
    const { userId, creditAmount } = session.metadata

    // Update user's credits in database
    // This would typically call your database update function
    // For now, we'll log it and assume it's handled elsewhere
    console.log(`Adding ${creditAmount} credits to user ${userId}`)

    // In a real implementation, you would:
    // 1. Update the user's credit balance
    // 2. Create a transaction record
    // 3. Send an email receipt

    return { success: true }
  } catch (error) {
    console.error("Error handling payment:", error)
    return { error: error.message }
  }
}
