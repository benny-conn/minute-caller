"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "@/app/components/Footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
              MinuteCaller
            </span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8 prose dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to MinuteCaller. These Terms of Service govern your use of
              our website and services. By using MinuteCaller, you agree to
              these terms. Please read them carefully.
            </p>

            <h2>2. Service Description</h2>
            <p>
              MinuteCaller provides a web-based platform for making
              international calls directly from your browser. Our service
              operates on a credit-based system where users purchase credits and
              spend them based on per-minute rates for different countries.
            </p>

            <h2>3. Account Registration</h2>
            <p>
              To use our services, you must create an account. You are
              responsible for maintaining the confidentiality of your account
              information and for all activities that occur under your account.
              You must provide accurate and complete information when creating
              your account.
            </p>

            <h2>4. Payment and Credits</h2>
            <p>
              Credits are purchased through our platform and are used to make
              calls. Credit rates vary by destination country. Credits do not
              expire. All purchases are final and non-refundable, except as
              required by applicable law.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>
              You agree not to use our service for any unlawful purpose or in
              any way that could damage, disable, overburden, or impair our
              service. You may not use our service for any abusive, harmful, or
              fraudulent activities.
            </p>

            <h2>6. Service Availability</h2>
            <p>
              We strive to provide uninterrupted service, but we do not
              guarantee that our service will be available at all times. We
              reserve the right to modify, suspend, or discontinue our service
              at any time without notice.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MinuteCaller shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              provide notice of significant changes by posting the new Terms on
              our website. Your continued use of our service after such
              modifications constitutes your acceptance of the new Terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which MinuteCaller operates,
              without regard to its conflict of law provisions.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at
              support@minutecaller.com.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
