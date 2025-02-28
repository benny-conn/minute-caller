export default function StructuredData({ type, data }) {
  // Convert the data object to a JSON string
  const jsonLd = JSON.stringify(data)

  // Return the structured data as a script tag
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  )
}
