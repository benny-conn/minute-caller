"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PhoneCall, Search, Globe, ArrowLeft } from "lucide-react"
import {
  getAllCountries,
  getAllContinents,
  getCountriesByContinent,
} from "@/app/lib/countryRates"

// Custom styles
const styles = {
  gradientText:
    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500",
  buttonGradient:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  inputFocus:
    "focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500",
}

export default function RatesPage() {
  const [searchInput, setSearchInput] = useState("")
  const [selectedContinent, setSelectedContinent] = useState("All")
  const [continents, setContinents] = useState([])
  const [displayCountries, setDisplayCountries] = useState([])
  const [allCountries, setAllCountries] = useState([])

  // Initialize data on component mount
  useEffect(() => {
    const countries = getAllCountries()
    setAllCountries(countries)

    const allContinents = getAllContinents()
    setContinents(["All", ...allContinents])

    // Set initial display countries
    updateDisplayCountries("All", "")
  }, [])

  // Update display countries when search or continent changes
  const updateDisplayCountries = (continent, search) => {
    let filteredCountries = []

    // Filter by continent
    if (continent === "All") {
      filteredCountries = [...allCountries]
    } else {
      filteredCountries = getCountriesByContinent(continent)
    }

    // Filter by search
    if (search.trim() !== "") {
      const searchTerm = search.toLowerCase().trim()
      filteredCountries = filteredCountries.filter(
        country =>
          country.name.toLowerCase().includes(searchTerm) ||
          country.code.includes(searchTerm)
      )
    }

    // Sort countries by name
    filteredCountries.sort((a, b) => a.name.localeCompare(b.name))

    setDisplayCountries(filteredCountries)
  }

  // Handle search input change
  const handleSearchChange = e => {
    const newSearch = e.target.value
    setSearchInput(newSearch)
    updateDisplayCountries(selectedContinent, newSearch)
  }

  // Handle continent change
  const handleContinentChange = continent => {
    setSelectedContinent(continent)
    updateDisplayCountries(continent, searchInput)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className={styles.gradientText}>Minute</span>Caller
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <Link
              href="/auth/signin"
              className={`${styles.buttonGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              International Call Rates
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Check our competitive rates for calling international destinations
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
            {/* Search and filter controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search country or dial code..."
                  className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 ${styles.inputFocus} text-gray-700 dark:text-gray-300`}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {continents.map(continent => (
                  <button
                    key={continent}
                    onClick={() => handleContinentChange(continent)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedContinent === continent
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}>
                    {continent}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {displayCountries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dial Code
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rate (Credits/Min)
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Continent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                    {displayCountries.map(country => (
                      <tr
                        key={country.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                          {country.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {country.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {country.rate}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {country.continent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No countries found matching your search
                </p>
                <button
                  onClick={() => {
                    setSearchInput("")
                    setSelectedContinent("All")
                    updateDisplayCountries("All", "")
                  }}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Clear filters
                </button>
              </div>
            )}

            {/* Call to action */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Ready to make international calls?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign up now and get started with our competitive rates.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    href="/auth/signup"
                    className={`${styles.buttonGradient} text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-indigo-500/10`}>
                    Sign Up Now
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} MinuteCaller. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
