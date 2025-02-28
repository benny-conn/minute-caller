"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "@/app/components/Footer"
import StructuredData from "@/app/components/StructuredData"

// JSON-LD structured data for the privacy policy page
const privacyStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy - MinuteCaller",
  description:
    "Privacy Policy for MinuteCaller international calling service. Learn how we collect, use, and protect your personal information.",
  url: "https://minutecaller.com/policies/privacy",
  mainEntity: {
    "@type": "WebContent",
    about: {
      "@type": "Thing",
      name: "Privacy Policy",
    },
  },
}

export const metadata = {
  title: "Privacy Policy - MinuteCaller",
  description:
    "Read the Privacy Policy for MinuteCaller's international calling service. Learn how we collect, use, and protect your personal information when you use our browser-based calling platform.",
  alternates: {
    canonical: "/policies/privacy",
  },
}

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Structured Data */}
      <StructuredData data={privacyStructuredData} />

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
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8 prose dark:prose-invert max-w-none">
            <h2 id="introduction">1. Introduction</h2>
            <p>
              At MinuteCaller, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our website and services.
            </p>

            <h2 id="information-collection">2. Information Collection</h2>
            <p>
              We collect information that you provide directly to us, such as
              when you create an account, make a purchase, or contact customer
              support. This may include your name, email address, phone number,
              and payment information.
            </p>
            <p>
              We also automatically collect certain information when you use our
              service, including your IP address, browser type, device
              information, and usage data.
            </p>

            <h2 id="information-use">3. Use of Information</h2>
            <p>
              We use the information we collect to provide, maintain, and
              improve our services, process transactions, send communications,
              and for security and fraud prevention.
            </p>

            <h2 id="information-sharing">4. Sharing of Information</h2>
            <p>
              We may share your information with service providers who perform
              services on our behalf, such as payment processing and customer
              support. We may also share information when required by law or to
              protect our rights.
            </p>

            <h2 id="data-security">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your
              information from unauthorized access, alteration, or destruction.
              However, no method of transmission over the Internet is 100%
              secure.
            </p>

            <h2 id="user-rights">6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, such as the right to access, correct,
              or delete your data. To exercise these rights, please contact us.
            </p>

            <h2 id="cookies">7. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience
              on our website. You can manage your cookie preferences through
              your browser settings.
            </p>

            <h2 id="childrens-privacy">8. Children&apos;s Privacy</h2>
            <p>
              Our service is not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children.
            </p>

            <h2 id="policy-changes">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on our
              website. Your continued use of our service after such
              modifications constitutes your acceptance of the updated policy.
            </p>

            <h2 id="contact">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a href="mailto:privacy@minutecaller.com">
                privacy@minutecaller.com
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
