# Sukkar Tools

A free, all-in-one online toolbox with 35+ tools — no login required.

**Live Site**: https://sukkar.lovable.app  
**Lovable Project**: https://lovable.dev/projects/118ee056-6e06-414f-bbb4-2efacaf164e2

---

## What's Been Done

### 🔗 Tool Permalinks
- Each tool has its own shareable URL: `/tool/:toolId` (e.g., `/tool/qr`, `/tool/json`)
- URL-based routing via `react-router-dom` — direct links work on page refresh
- Browser back/forward navigation works correctly between tools

### 🔍 Dynamic SEO Meta Tags
- `<title>` updates dynamically based on the active tool (e.g., `QR Code Generator – Sukkar Tools`)
- `<meta name="description">` updates per tool for better search snippets
- Open Graph tags (`og:title`, `og:description`) update for richer social media previews
- Resets to default site-wide values on the homepage

### 🗺️ Sitemap
- `public/sitemap.xml` lists all 35+ tool permalinks
- Includes homepage with `priority: 1.0` and all tools with `priority: 0.8`
- Uses `https://sukkar.lovable.app` as the canonical base URL
- Submit to Google Search Console: `https://sukkar.lovable.app/sitemap.xml`

### 🤖 Robots.txt
- `public/robots.txt` allows all major crawlers (Googlebot, Bingbot, Twitterbot, Facebook)

---

## Tools Available

| Category | Tools |
|---|---|
| **Text** | Text Case, Word Counter, Markdown Preview, Lorem Ipsum, Diff Checker, Typing Test |
| **Developer** | JSON Formatter, Base64, Data Encoder, UUID Generator, HTML→BBCode, Hash Generator, Regex Helper |
| **Converters** | Color Picker, Unit Converter, Image Resizer |
| **Generators** | Password Gen, QR Code, Barcode, WhatsApp Link, Invoice Maker, WooCommerce CSV, URL Shortener |
| **Calculators** | Calculator, Age Calculator, BMI Calculator |
| **Media** | Text to Speech, Speech to Text, Sound Visualizer, M3U Player |
| **Productivity** | Fresh Notes, Stopwatch & Timer, Steadfast Booking |

---

## Tech Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **react-router-dom** for client-side routing
