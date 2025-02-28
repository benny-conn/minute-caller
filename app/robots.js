export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/callback", "/dashboard/settings"],
    },
    sitemap: "https://minutecaller.com/sitemap.xml",
  }
}
