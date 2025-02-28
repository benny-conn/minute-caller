"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "@/app/components/Footer"
import StructuredData from "@/app/components/StructuredData"
import Head from "next/head"

// JSON-LD structured data for the terms page
const termsStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service - MinuteCaller",
  description:
    "Terms of Service for MinuteCaller international calling service. Read our terms and conditions for using our browser-based calling platform.",
  url: "https://minutecaller.com/policies/terms",
  mainEntity: {
    "@type": "WebContent",
    about: {
      "@type": "Thing",
      name: "Terms of Service",
    },
  },
}

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Structured Data */}
      <StructuredData data={termsStructuredData} />

      <Head>
        <title>Terms of Service - MinuteCaller</title>
        <meta
          name="description"
          content="Read the Terms of Service for MinuteCaller's international calling service. Learn about our policies, user agreements, and service conditions."
        />
        <link rel="canonical" href="/policies/terms" />
      </Head>

      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="MinuteCaller Home">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
              MinuteCaller
            </span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium flex items-center gap-1.5"
            aria-label="Back to Home">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8 prose dark:prose-invert max-w-none">
            <h2 id="introduction">1. Introduction</h2>
            <p>
              Welcome to MinuteCaller. These Terms of Service govern your use of
              our website and services. By using MinuteCaller, you agree to
              these terms. Please read them carefully.
            </p>

            <h2 id="service-description">2. Service Description</h2>
            <p>
              MinuteCaller provides a browser-based international calling
              service that allows users to make calls to international phone
              numbers. Our service operates on a pay-as-you-go credit system.
            </p>

            <h2 id="account-registration">3. Account Registration</h2>
            <p>
              To use our services, you must create an account. You are
              responsible for maintaining the confidentiality of your account
              information and for all activities that occur under your account.
            </p>

            <h2 id="payment-credits">4. Payment and Credits</h2>
            <p>
              Our service operates on a credit-based system. Credits can be
              purchased through our platform and are used to make calls at rates
              specified for each country. Unused credits do not expire.
            </p>

            <h2 id="acceptable-use">5. Acceptable Use</h2>
            <p>
              You agree not to use our service for any unlawful purpose or in
              any way that could damage, disable, or impair our service. You
              must not use our service for spam, harassment, or any abusive
              activities.
            </p>

            <h2 id="service-availability">6. Service Availability</h2>
            <p>
              While we strive to provide uninterrupted service, we do not
              guarantee that our service will be available at all times. We
              reserve the right to modify, suspend, or discontinue our service
              at any time.
            </p>

            <h2 id="limitation-liability">7. Limitation of Liability</h2>
            <p>
              MinuteCaller is not liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use or
              inability to use our service.
            </p>

            <h2 id="changes-terms">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              provide notice of significant changes. Your continued use of our
              service after such modifications constitutes your acceptance of
              the updated terms.
            </p>

            <h2 id="governing-law">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which
              MinuteCaller is registered, without regard to its conflict of law
              provisions.
            </p>

            <h2 id="contact">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:support@minutecaller.com">
                support@minutecaller.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
