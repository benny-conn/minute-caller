#!/usr/bin/env node

/**
 * This is a simple script to help update the favicon in your Next.js app.
 *
 * Usage:
 * 1. Save your favicon.ico file to the public directory
 * 2. Run this script: node update-favicon.js
 *
 * The script will:
 * - Copy the favicon.ico from public/ to app/
 * - Update the layout.js file to include favicon metadata (if needed)
 */

const fs = require("fs")
const path = require("path")

// Paths
const publicFaviconPath = path.join(process.cwd(), "public", "favicon.ico")
const appFaviconPath = path.join(process.cwd(), "app", "favicon.ico")
const layoutPath = path.join(process.cwd(), "app", "layout.js")

// Check if favicon exists in public directory
if (!fs.existsSync(publicFaviconPath)) {
  console.error("❌ Error: favicon.ico not found in public directory")
  console.log(
    "Please generate a favicon and save it to public/favicon.ico first"
  )
  process.exit(1)
}

// Copy favicon from public to app directory
try {
  fs.copyFileSync(publicFaviconPath, appFaviconPath)
  console.log("✅ Copied favicon.ico from public/ to app/")
} catch (error) {
  console.error("❌ Error copying favicon:", error.message)
  process.exit(1)
}

// Check if layout.js exists and update it if needed
if (fs.existsSync(layoutPath)) {
  let layoutContent = fs.readFileSync(layoutPath, "utf8")

  // Check if metadata is already defined
  if (layoutContent.includes("export const metadata")) {
    // Check if icons are already defined in metadata
    if (!layoutContent.includes("icons:")) {
      // Add icons to existing metadata
      layoutContent = layoutContent.replace(
        /export const metadata = {/,
        `export const metadata = {\n  icons: {\n    icon: '/favicon.ico',\n  },`
      )
      fs.writeFileSync(layoutPath, layoutContent)
      console.log("✅ Updated layout.js with favicon metadata")
    } else {
      console.log("ℹ️ layout.js already has icon metadata, no changes needed")
    }
  } else {
    // Add new metadata export before the first export or function
    const metadataBlock = `export const metadata = {
  title: 'MinuteCaller',
  description: 'Make international calls from your browser',
  icons: {
    icon: '/favicon.ico',
  },
};\n\n`

    // Find a good place to insert the metadata
    if (layoutContent.includes("export default")) {
      layoutContent = layoutContent.replace(
        /export default/,
        `${metadataBlock}export default`
      )
      fs.writeFileSync(layoutPath, layoutContent)
      console.log("✅ Added metadata to layout.js")
    } else {
      console.log("⚠️ Could not automatically update layout.js")
      console.log("Please manually add the following to your layout.js:")
      console.log(metadataBlock)
    }
  }
} else {
  console.log("⚠️ layout.js not found in app directory")
  console.log("Please make sure your favicon.ico is in the public directory")
}

console.log("\n🎉 Favicon update complete!")
console.log("Your favicon should now be visible in your Next.js app")
