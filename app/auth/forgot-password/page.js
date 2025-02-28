import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm"
import Link from "next/link"
import { PhoneCall } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <PhoneCall className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold">MinuteCaller</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <ForgotPasswordForm />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="container mx-auto px-4">
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
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
