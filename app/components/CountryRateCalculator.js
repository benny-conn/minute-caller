"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Globe } from "lucide-react"
import {
  searchCountries,
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

export default function CountryRateCalculator({
  isCompact = false,
  maxResults = 5,
  showAllRatesLink = true,
}) {
  const [searchInput, setSearchInput] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedContinent, setSelectedContinent] = useState("All")
  const [continents, setContinents] = useState([])
  const [continentCountries, setContinentCountries] = useState([])

  // Initialize continents on component mount
  useEffect(() => {
    const allContinents = getAllContinents()
    setContinents(["All", ...allContinents])

    // Set initial countries based on selected continent
    updateContinentCountries("All")
  }, [])

  // Update countries when continent changes
  useEffect(() => {
    updateContinentCountries(selectedContinent)
  }, [selectedContinent])

  // Update search results when input changes
  useEffect(() => {
    if (searchInput.trim() === "") {
      setSearchResults([])
      return
    }

    const results = searchCountries(searchInput)
    setSearchResults(results.slice(0, maxResults))
  }, [searchInput, maxResults])

  // Update continent countries
  const updateContinentCountries = continent => {
    if (continent === "All") {
      // Get a sample of countries from each continent
      const allContinents = getAllContinents()
      let countries = []

      allContinents.forEach(cont => {
        const contCountries = getCountriesByContinent(cont)
        countries = [...countries, ...contCountries.slice(0, 2)] // Take 2 from each continent
      })

      setContinentCountries(countries.slice(0, maxResults))
    } else {
      const countries = getCountriesByContinent(continent)
      setContinentCountries(countries.slice(0, maxResults))
    }
  }

  const handleSearchChange = e => {
    setSearchInput(e.target.value)
  }

  const handleContinentChange = continent => {
    setSelectedContinent(continent)
    setSearchInput("") // Clear search when changing continent
  }

  // Determine which countries to display
  const displayCountries =
    searchInput.trim() !== "" ? searchResults : continentCountries

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 ${
        isCompact ? "p-4" : "p-6"
      }`}>
      {/* Header */}
      <div className={`${isCompact ? "mb-3" : "mb-5"}`}>
        <h3
          className={`font-semibold text-gray-800 dark:text-gray-200 ${
            isCompact ? "text-base" : "text-lg"
          }`}>
          Country Rate Calculator
        </h3>
        <p
          className={`text-gray-600 dark:text-gray-400 ${
            isCompact ? "text-xs mt-0.5" : "text-sm mt-1"
          }`}>
          Check how many credits you need for different countries
        </p>
      </div>

      {/* Search input */}
      <div className={`relative ${isCompact ? "mb-3" : "mb-5"}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search country or dial code..."
          className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 ${
            styles.inputFocus
          } text-gray-700 dark:text-gray-300 ${isCompact ? "text-sm" : ""}`}
        />
      </div>

      {/* Continent filters */}
      {!isCompact && (
        <div className="flex flex-wrap gap-2 mb-5">
          {continents.map(continent => (
            <button
              key={continent}
              onClick={() => handleContinentChange(continent)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                selectedContinent === continent
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}>
              {continent}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div
        className={`space-y-2 ${
          isCompact ? "max-h-[240px]" : "max-h-[320px]"
        } overflow-y-auto pr-1`}>
        {displayCountries.length > 0 ? (
          displayCountries.map(country => (
            <div
              key={country.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <div
                    className={`text-gray-500 dark:text-gray-400 ${
                      isCompact ? "text-xs" : "text-sm"
                    }`}>
                    {country.name}
                  </div>
                  <div
                    className={`font-medium text-gray-800 dark:text-gray-200 ${
                      isCompact ? "text-sm" : ""
                    }`}>
                    {country.code}
                  </div>
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {country.rate} credits/min
                </div>
              </div>
            </div>
          ))
        ) : searchInput.trim() !== "" ? (
          <div className="text-center py-6">
            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              No countries found matching &quot;{searchInput}&quot;
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              Select a continent or search for a country
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {showAllRatesLink && (
        <div className={`${isCompact ? "mt-3" : "mt-5"} flex justify-center`}>
          <Link
            href="/rates"
            className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
            View all rates
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
