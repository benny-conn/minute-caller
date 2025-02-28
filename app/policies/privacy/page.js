"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "@/app/components/Footer"

export default function PrivacyPage() {
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
              Privacy Policy
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
              At MinuteCaller, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our website and services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as
              when you create an account, make a purchase, or contact customer
              support. This may include:
            </p>
            <ul>
              <li>Contact information (name, email address, phone number)</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Call records (numbers called, duration, time)</li>
              <li>Communications with us</li>
            </ul>
            <p>
              We also automatically collect certain information when you use our
              service, including:
            </p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and manage your account</li>
              <li>Communicate with you about our services</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Protect against fraudulent or unauthorized activity</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Service providers who perform services on our behalf</li>
              <li>Payment processors to complete transactions</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the Internet or electronic storage is 100%
              secure, so we cannot guarantee absolute security.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul>
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information
              provided below.
            </p>

            <h2>7. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience
              on our website. You can manage your cookie preferences through
              your browser settings.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on our
              website. Your continued use of our service after such
              modifications constitutes your acceptance of the updated policy.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at privacy@minutecaller.com.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
