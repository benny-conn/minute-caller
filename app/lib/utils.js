import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Combines Tailwind CSS classes without conflicts
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format a phone number for display
export function formatPhoneNumber(phoneNumber) {
  // Basic formatting for US numbers (more complex implementation would handle international)
  if (!phoneNumber) return ""

  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Format US numbers as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // Format international numbers with + and proper spacing
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(
      -10,
      -7
    )} ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`
  }

  // If it doesn't match known patterns, return the cleaned number
  return cleaned
}

// Format currency for display
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100) // Assumes amount is in cents
}

// Format duration in seconds to minutes:seconds
export function formatDuration(seconds) {
  if (!seconds) return "0:00"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Calculate call cost based on duration and rate
export function calculateCallCost(durationSeconds, ratePerMinute) {
  const durationMinutes = durationSeconds / 60
  // Round up to nearest minute
  const billedMinutes = Math.ceil(durationMinutes)
  return billedMinutes * ratePerMinute
}

// Get country code from phone number
export function getCountryCodeFromPhoneNumber(phoneNumber) {
  // This is a simplified version - in a real app, you'd use a more robust library
  if (!phoneNumber) return "unknown"

  const cleaned = phoneNumber.replace(/\D/g, "")

  // Very simplified country code detection
  if (cleaned.startsWith("1")) return "US"
  if (cleaned.startsWith("44")) return "GB"
  if (cleaned.startsWith("49")) return "DE"
  if (cleaned.startsWith("33")) return "FR"
  if (cleaned.startsWith("91")) return "IN"
  if (cleaned.startsWith("86")) return "CN"

  // Default if we can't determine
  return "unknown"
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Validate phone number (basic implementation)
export function isValidPhoneNumber(phoneNumber) {
  // This is a very basic validation - in a real app, use a library like libphonenumber-js
  if (!phoneNumber) return false

  // Remove all non-numeric characters except '+'
  const cleaned = phoneNumber.replace(/[^\d+]/g, "")

  // Basic check - must have at least 10 digits
  return cleaned.replace(/\D/g, "").length >= 10
}
