# MinuteCaller Favicon Generator

This directory contains tools to help you create and implement a favicon for your MinuteCaller application.

## Files Included

- `phone-icon.svg` - A simple phone icon in indigo color
- `phone-icon-gradient.svg` - A phone icon with a gradient background
- `favicon-square.svg` - A square icon with gradient background
- `favicon-square-clean.svg` - An optimized clean square icon (recommended for favicon)
- `favicon-generator.html` - A web-based tool to generate a favicon from the SVG files
- `update-favicon.js` - A Node.js script to help update the favicon in your Next.js app

## How to Generate a Favicon

### Option 1: Using the Web-Based Generator

1. Open `favicon-generator.html` in your browser
2. Click on one of the "Generate Favicon" buttons to create a favicon from the corresponding icon
3. Once generated, click the "Download Favicon" button to save the favicon.ico file
4. Place the downloaded favicon.ico file in the public directory of your project

### Option 2: Using an Online Favicon Generator Service

For the best results, we recommend using an online favicon generator service that can create multiple sizes and formats:

1. Download one of the SVG files (we recommend `favicon-square-clean.svg`)
2. Upload it to one of these services:
   - [Real Favicon Generator](https://realfavicongenerator.net/) - Upload the SVG and get a complete favicon package
   - [Favicon.io](https://favicon.io/favicon-converter/) - Simple converter for various image formats
   - [Favicon Generator](https://www.favicon-generator.org/) - Another option for creating favicons
3. Follow the service's instructions to download the generated favicon files
4. Place the favicon.ico file in the public directory of your project

## Implementing the Favicon in Your Next.js App

### Option 1: Using the Update Script

After generating and saving your favicon.ico to the public directory, run:

```bash
node public/update-favicon.js
```

This script will:

- Copy the favicon.ico from public/ to app/
- Update the layout.js file to include favicon metadata (if needed)

### Option 2: Manual Implementation

1. Place the favicon.ico file in both the public/ and app/ directories
2. Update your app/layout.js file to include the favicon metadata:

```javascript
export const metadata = {
  title: "MinuteCaller",
  description: "Make international calls from your browser",
  icons: {
    icon: "/favicon.ico",
  },
}
```

## Additional Information

For more advanced favicon support, you might want to generate multiple sizes and formats. The Real Favicon Generator service can help with this, and you can update your metadata accordingly:

```javascript
export const metadata = {
  title: "MinuteCaller",
  description: "Make international calls from your browser",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
}
```
