# MinuteCaller SEO Guide

This document outlines the SEO optimizations implemented for the MinuteCaller application and provides guidance for maintaining and improving search engine visibility.

## Implemented SEO Features

### 1. Metadata Optimization

- **Title Tags**: Optimized for each page with primary keywords and brand name
- **Meta Descriptions**: Detailed, compelling descriptions with relevant keywords
- **Canonical URLs**: Implemented to prevent duplicate content issues
- **Open Graph & Twitter Cards**: Added for better social media sharing

### 2. Structured Data (JSON-LD)

- **WebSite**: Basic website information for search engines
- **Organization**: Company details for knowledge graph
- **Service**: Details about the calling service
- **WebPage**: Specific page information for terms and privacy pages

### 3. Technical SEO

- **Sitemap.js**: Dynamic sitemap generation with priority settings
- **Robots.js**: Proper crawling instructions for search engines
- **Semantic HTML**: Proper heading hierarchy and semantic elements
- **Accessibility**: ARIA attributes and proper alt text

### 4. Content Optimization

- **Keyword-rich headings**: H1, H2, etc. with relevant keywords
- **Descriptive link text**: Clear anchor text for internal links
- **Content structure**: Organized with proper headings and paragraphs

### 5. Image Optimization

- **SVG & PNG versions**: For different use cases
- **Alt text**: Descriptive alternative text for images
- **Open Graph images**: Custom images for social sharing

## SEO Best Practices for Future Development

### 1. Content Updates

- Regularly update content with relevant keywords
- Create blog posts or guides about international calling
- Add FAQ sections to address common user questions

### 2. Performance Optimization

- Optimize image sizes and formats
- Implement lazy loading for images
- Minimize CSS and JavaScript files

### 3. Mobile Optimization

- Ensure responsive design works on all devices
- Test mobile usability with Google's mobile-friendly test
- Optimize tap targets and font sizes

### 4. Local SEO (if applicable)

- Create Google Business Profile
- Optimize for local keywords
- Get listed in relevant directories

### 5. Monitoring and Improvement

- Set up Google Search Console
- Monitor keyword rankings
- Analyze user behavior with analytics

## Keyword Strategy

### Primary Keywords

- international calls
- browser calling
- online calling service
- international calling rates
- Skype alternative

### Secondary Keywords

- no download calling
- pay-as-you-go calls
- cheap international calls
- call abroad
- browser-based calls

### Long-tail Keywords

- make international calls from browser
- call international numbers without app
- pay-as-you-go international calling service
- cheapest way to call overseas
- how to call international numbers online

## Page-Specific SEO

### Home Page

- Focus on primary service offering and unique selling points
- Highlight "no downloads" and "browser-based" aspects
- Include testimonials and trust signals

### Rates Page

- Optimize for "international calling rates" and related terms
- Include country-specific rate information
- Add comparison with competitors if possible

### Terms & Privacy Pages

- Use clear headings with proper IDs for deep linking
- Include structured data for legal content
- Make content scannable and easy to read

## Technical Implementation Notes

### Metadata in Next.js

```javascript
export const metadata = {
  title: "Page Title - MinuteCaller",
  description: "Detailed description with keywords",
  // Other metadata
}
```

### Structured Data Implementation

```javascript
import StructuredData from "@/app/components/StructuredData"

// In your component
;<StructuredData data={yourStructuredData} />
```

### Image Conversion

Run the image conversion script to generate PNG files from SVG:

```bash
node scripts/convert-images.js
```

## SEO Audit Checklist

- [ ] All pages have unique title tags and meta descriptions
- [ ] Structured data is implemented and valid
- [ ] Images have appropriate alt text
- [ ] Internal linking structure is logical
- [ ] Mobile experience is optimized
- [ ] Page load speed is acceptable
- [ ] No broken links or 404 errors
- [ ] Sitemap is accessible and up-to-date
- [ ] robots.txt is properly configured
- [ ] Google Search Console is set up and monitoring

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)
