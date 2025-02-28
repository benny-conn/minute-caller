"use client"

import Link from "next/link"
import { Twitter } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} MinuteCaller. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://twitter.com/tubesqueezing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <span className="flex items-center gap-1.5">
                <Twitter className="h-4 w-4" />
                <span className="text-sm">@tubesqueezing</span>
              </span>
            </Link>

            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/policies/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Terms
              </Link>
              <Link
                href="/policies/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
