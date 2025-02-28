"use client"

import { useState } from "react"
import Link from "next/link"
import { PhoneCall, Check, ArrowRight } from "lucide-react"
import CountryRateCalculator from "@/app/components/CountryRateCalculator"

// Custom styles
const styles = {
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  gradientBorder:
    "bg-gradient-to-r from-indigo-500/50 to-violet-500/50 p-[1px] rounded-2xl",
  heroGradient:
    "bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800",
}

export default function HeroSection() {
  return (
    <div
      className={`${styles.heroGradient} py-16 md:py-24 lg:py-32 overflow-hidden`}>
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left hero content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="relative z-10">
              <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                Simple credit based calls
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Call anywhere with{" "}
                <span className={styles.gradientText}>MinuteCaller</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Make affordable international calls directly from your browser.
                No downloads required, just sign up and start calling.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/signin"
                  className={`${styles.buttonGradient} text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform hover:translate-y-[-2px]`}>
                  <PhoneCall className="h-5 w-5" />
                  Start Calling Now
                </Link>

                <Link
                  href="#pricing"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
                  View Pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    No downloads needed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Pay-as-you-go pricing
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Available worldwide
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right hero - call simulation */}
          <div className="flex-1 w-full max-w-md">
            <div className={`${styles.gradientBorder}`}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-indigo-500/5 overflow-hidden">
                {/* Call widget header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">Call Rate Calculator</h3>
                    </div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      Live Rates
                    </div>
                  </div>
                </div>

                {/* Call widget body */}
                <div className="p-0">
                  <CountryRateCalculator maxResults={5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      </div>
    </div>
  )
}
