#!/usr/bin/env node

/**
 * This script converts SVG images to PNG for better compatibility with social media platforms.
 *
 * Usage:
 * 1. Install dependencies: npm install sharp
 * 2. Run: node scripts/convert-images.js
 */

const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

// Paths
const publicDir = path.join(process.cwd(), "public")
const svgFiles = [
  {
    input: path.join(publicDir, "og-image.svg"),
    output: path.join(publicDir, "og-image.png"),
    width: 1200,
    height: 630,
  },
  {
    input: path.join(publicDir, "twitter-image.svg"),
    output: path.join(publicDir, "twitter-image.png"),
    width: 1200,
    height: 675,
  },
  {
    input: path.join(publicDir, "favicon-square-clean.svg"),
    output: path.join(publicDir, "apple-icon.png"),
    width: 180,
    height: 180,
  },
  {
    input: path.join(publicDir, "favicon-square-clean.svg"),
    output: path.join(publicDir, "icon-192.png"),
    width: 192,
    height: 192,
  },
  {
    input: path.join(publicDir, "favicon-square-clean.svg"),
    output: path.join(publicDir, "icon-512.png"),
    width: 512,
    height: 512,
  },
]

async function convertSvgToPng() {
  console.log("Converting SVG images to PNG...")

  for (const file of svgFiles) {
    try {
      if (!fs.existsSync(file.input)) {
        console.error(`❌ Error: ${file.input} not found`)
        continue
      }

      const svgBuffer = fs.readFileSync(file.input)

      await sharp(svgBuffer)
        .resize(file.width, file.height)
        .png()
        .toFile(file.output)

      console.log(
        `✅ Converted: ${path.basename(file.input)} → ${path.basename(
          file.output
        )}`
      )
    } catch (error) {
      console.error(`❌ Error converting ${file.input}:`, error.message)
    }
  }

  console.log("\n🎉 Conversion complete!")
  console.log(
    'Remember to update your package.json with: "dependencies": { "sharp": "^0.32.1" }'
  )
}

convertSvgToPng()
