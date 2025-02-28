import HeroSection from "@/app/components/landing/HeroSection"
import Link from "next/link"
import Image from "next/image"
import {
  PhoneCall,
  Globe,
  CreditCard,
  Shield,
  ChevronRight,
  Check,
} from "lucide-react"
import Footer from "@/app/components/Footer"
import StructuredData from "@/app/components/StructuredData"

// Custom styles
const styles = {
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  cardShadow: "shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20",
  cardHover: "transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
}

// JSON-LD structured data for the home page
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MinuteCaller",
  url: "https://minutecaller.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://minutecaller.com/rates?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MinuteCaller",
  url: "https://minutecaller.com",
  logo: "https://minutecaller.com/logo.png",
  description:
    "Make affordable international calls directly from your browser with MinuteCaller. No downloads, no contracts - just pay-as-you-go with competitive rates to 180+ countries.",
  sameAs: ["https://twitter.com/tubesqueezing"],
}

const serviceStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "MinuteCaller International Calling",
  provider: {
    "@type": "Organization",
    name: "MinuteCaller",
  },
  description:
    "Make affordable international calls directly from your browser. No downloads required, just sign up and start calling.",
  offers: {
    "@type": "Offer",
    price: "0.01",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "0.01",
      priceCurrency: "USD",
      unitText: "per minute",
      billingIncrement: "P1M",
      priceType: "https://schema.org/InvoicePrice",
    },
  },
  areaServed: {
    "@type": "Country",
    name: "Worldwide",
  },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Structured Data */}
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={serviceStructuredData} />

      {/* Header/Navigation */}
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="MinuteCaller Home">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500">
              <PhoneCall className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold">
              <span className={styles.gradientText}>Minute</span>Caller
            </span>
          </Link>

          <nav
            className="hidden md:flex space-x-6"
            aria-label="Main Navigation">
            <Link
              href="/#features"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Pricing
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              How It Works
            </Link>
            <Link
              href="/rates"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Rates
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className={`${styles.buttonGradient} text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-indigo-500/20`}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <section
          id="features"
          className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                Why Choose MinuteCaller
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Features that make us{" "}
                <span className={styles.gradientText}>stand out</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div
                className={`bg-white dark:bg-gray-800 p-8 rounded-2xl ${styles.cardShadow} ${styles.cardHover}`}>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
                  <Globe
                    className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Call any international number worldwide at competitive rates.
                  No hidden fees.
                </p>
              </div>

              <div
                className={`bg-white dark:bg-gray-800 p-8 rounded-2xl ${styles.cardShadow} ${styles.cardHover}`}>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
                  <CreditCard className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Pay As You Go</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Only pay for what you use. Buy credits in packages and use
                  them anytime.
                </p>
              </div>

              <div
                className={`bg-white dark:bg-gray-800 p-8 rounded-2xl ${styles.cardShadow} ${styles.cardHover}`}>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Calls</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All calls are encrypted and secure. Your privacy is our
                  priority.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                Simple, Transparent Pricing
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pay only for what you{" "}
                <span className={styles.gradientText}>use</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the credit package that fits your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div
                className={`bg-white dark:bg-gray-800 rounded-2xl ${styles.cardShadow} ${styles.cardHover} overflow-hidden`}>
                <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-1">Starter</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    For occasional calls
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$5</span>
                    <span className="text-gray-500 ml-2">for 50 minutes</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>10¢ per minute</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>No expiration</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>HD call quality</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/signup"
                    className="mt-8 block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center px-4 py-3 rounded-xl font-medium transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>

              <div
                className={`bg-white dark:bg-gray-800 rounded-2xl ${styles.cardShadow} transform scale-105 overflow-hidden border-2 border-indigo-500`}>
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
                <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-1">Value</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Best for regular callers
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$10</span>
                    <span className="text-gray-500 ml-2">for 120 minutes</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>8.3¢ per minute</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>No expiration</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>HD call quality</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/signup"
                    className={`mt-8 block w-full ${styles.buttonGradient} text-white text-center px-4 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/20`}>
                    Get Started
                  </Link>
                </div>
              </div>

              <div
                className={`bg-white dark:bg-gray-800 rounded-2xl ${styles.cardShadow} ${styles.cardHover} overflow-hidden`}>
                <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-1">Premium</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    For frequent callers
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$20</span>
                    <span className="text-gray-500 ml-2">for 300 minutes</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>6.7¢ per minute</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>No expiration</span>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>HD call quality</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/signup"
                    className="mt-8 block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center px-4 py-3 rounded-xl font-medium transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                Simple Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                How <span className={styles.gradientText}>It Works</span>
              </h2>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center relative">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-indigo-500/20">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Sign Up</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create your account in seconds with just an email.
                  </p>

                  {/* Connector line (hidden on mobile) */}
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-indigo-500/50 to-violet-500/50"></div>
                </div>

                <div className="text-center relative">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-indigo-500/20">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Buy Credits</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Purchase a credit package that fits your needs.
                  </p>

                  {/* Connector line (hidden on mobile) */}
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-indigo-500/50 to-violet-500/50"></div>
                </div>

                <div className="text-center relative">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-indigo-500/20">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Dial Number</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter the international number you want to call.
                  </p>

                  {/* Connector line (hidden on mobile) */}
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-indigo-500/50 to-violet-500/50"></div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-indigo-500/20">
                    4
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Start Talking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect instantly and enjoy crystal-clear audio.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/auth/signup"
                className={`${styles.buttonGradient} text-white px-8 py-3 rounded-xl font-medium inline-block shadow-lg shadow-indigo-500/20 transition-transform hover:translate-y-[-2px]`}>
                Get Started Now
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-white dark:bg-gray-800">
          {/* ... existing FAQ content ... */}
        </section>
      </main>

      {/* Replace the old footer with the new Footer component */}
      <Footer />
    </div>
  )
}
