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
  title: "MinuteCaller - Pay-as-you-go international calls from your browser",
  description:
    "MinuteCaller - A Skype alternative to call international numbers worldwide",
  keywords: [
    "international calls",
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
  ],
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
