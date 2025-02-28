// Country rates data for international calls
// This file contains the rates for different countries in credits per minute

export const COUNTRY_RATES = [
  {
    id: "uk",
    name: "United Kingdom",
    code: "+44",
    rate: 1.2,
    continent: "Europe",
  },
  {
    id: "de",
    name: "Germany",
    code: "+49",
    rate: 1.5,
    continent: "Europe",
  },
  {
    id: "fr",
    name: "France",
    code: "+33",
    rate: 1.4,
    continent: "Europe",
  },
  {
    id: "es",
    name: "Spain",
    code: "+34",
    rate: 1.6,
    continent: "Europe",
  },
  {
    id: "it",
    name: "Italy",
    code: "+39",
    rate: 1.5,
    continent: "Europe",
  },
  {
    id: "jp",
    name: "Japan",
    code: "+81",
    rate: 2.0,
    continent: "Asia",
  },
  {
    id: "cn",
    name: "China",
    code: "+86",
    rate: 1.8,
    continent: "Asia",
  },
  {
    id: "in",
    name: "India",
    code: "+91",
    rate: 1.3,
    continent: "Asia",
  },
  {
    id: "au",
    name: "Australia",
    code: "+61",
    rate: 1.7,
    continent: "Oceania",
  },
  {
    id: "nz",
    name: "New Zealand",
    code: "+64",
    rate: 1.9,
    continent: "Oceania",
  },
  {
    id: "us",
    name: "United States",
    code: "+1",
    rate: 1.0,
    continent: "North America",
  },
  {
    id: "ca",
    name: "Canada",
    code: "+1",
    rate: 1.1,
    continent: "North America",
  },
  {
    id: "mx",
    name: "Mexico",
    code: "+52",
    rate: 1.4,
    continent: "North America",
  },
  {
    id: "br",
    name: "Brazil",
    code: "+55",
    rate: 1.8,
    continent: "South America",
  },
  {
    id: "ar",
    name: "Argentina",
    code: "+54",
    rate: 1.9,
    continent: "South America",
  },
  {
    id: "za",
    name: "South Africa",
    code: "+27",
    rate: 2.1,
    continent: "Africa",
  },
  {
    id: "ng",
    name: "Nigeria",
    code: "+234",
    rate: 2.3,
    continent: "Africa",
  },
  {
    id: "eg",
    name: "Egypt",
    code: "+20",
    rate: 2.2,
    continent: "Africa",
  },
  {
    id: "ru",
    name: "Russia",
    code: "+7",
    rate: 1.7,
    continent: "Europe",
  },
  {
    id: "sg",
    name: "Singapore",
    code: "+65",
    rate: 1.6,
    continent: "Asia",
  },
]

// Function to search countries by name or code
export function searchCountries(query) {
  if (!query) return []

  const searchTerm = query.toLowerCase().trim()

  return COUNTRY_RATES.filter(
    country =>
      country.name.toLowerCase().includes(searchTerm) ||
      country.code.includes(searchTerm)
  )
}

// Function to get country by ID
export function getCountryById(id) {
  return COUNTRY_RATES.find(country => country.id === id)
}

// Function to get countries by continent
export function getCountriesByContinent(continent) {
  return COUNTRY_RATES.filter(country => country.continent === continent)
}

// Get all continents
export function getAllContinents() {
  const continents = new Set(COUNTRY_RATES.map(country => country.continent))
  return Array.from(continents)
}

// Get all countries
export function getAllCountries() {
  return COUNTRY_RATES
}
