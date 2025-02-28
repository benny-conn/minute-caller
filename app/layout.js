import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title:
    "MinuteCaller - Affordable International Calls from Your Browser | No Downloads",
  description:
    "Make affordable international calls directly from your browser with MinuteCaller. No downloads, no contracts - just pay-as-you-go with competitive rates to 180+ countries. The perfect Skype alternative for global calling.",
  keywords: [
    "international calls",
    "browser calling",
    "phone calls",
    "calling service",
    "Skype alternative",
    "VoIP",
    "global dialing",
    "pay-as-you-go",
    "international calling",
    "international phone calls",
    "international calling cards",
    "international calling rates",
    "international calling codes",
    "international calling apps",
    "call anywhere",
    "call anywhere in the world",
    "call anywhere in the world for cheap",
    "no download calling",
    "browser-based calls",
    "cheap international calls",
    "online calling service",
    "web calling",
    "call abroad",
    "call overseas",
    "global phone service",
    "international communication",
    "long distance calls",
  ],
  authors: [{ name: "MinuteCaller" }],
  creator: "MinuteCaller",
  publisher: "MinuteCaller",
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  metadataBase: new URL("https://minutecaller.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MinuteCaller - Affordable International Calls from Your Browser",
    description:
      "Make international calls directly from your browser. No downloads, no contracts - just pay-as-you-go with competitive rates worldwide.",
    url: "https://minutecaller.com",
    siteName: "MinuteCaller",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MinuteCaller - Make international calls from your browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MinuteCaller - Affordable International Calls from Your Browser",
    description:
      "Make international calls directly from your browser. No downloads required.",
    creator: "@tubesqueezing",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code when available
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}>
        {children}
      </body>
    </html>
  )
}
