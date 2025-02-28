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

// Custom styles
const styles = {
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  cardShadow: "shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20",
  cardHover: "transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header/Navigation */}
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className={styles.gradientText}>Minute</span>Caller
            </span>
          </Link>

          <nav className="hidden md:flex space-x-6">
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
                  <Globe className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
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
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Call history</span>
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
                    <li className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Priority support</span>
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PhoneCall className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold">MinuteCaller</span>
              </div>
              <p className="text-gray-400">
                The simple way to make international calls from your browser.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-400 hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-gray-400 hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} MinuteCaller. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
