# GCP Pulse 

**Executive Briefing & Intelligence Engine for Google Cloud Platform**

GCP Pulse is a high-performance, full-stack application designed to aggregate, analyze, and synthesize updates across the entire Google Cloud ecosystem. Built for cloud architects, security engineers, and technical leaders, the application leverages advanced LLM capabilities (Google Gemini) to reduce alert fatigue and accelerate knowledge acquisition.

---

## 🏗️ High-Level Architecture (HLD)

The application follows a **BFF (Backend-For-Frontend) Architecture** with a client-heavy presentation layer and a robust Node.js/Express aggregation server.

1. **Data Aggregation Layer (Backend):** An Express.js server acts as a proxy and aggregator. It fetches disparate RSS feeds, scrapes HTML (for deprecations/security bulletins), and queries REST APIs (YouTube). It normalizes this data into a unified JSON format, bypassing CORS issues and reducing client-side network overhead.
2. **AI Orchestration Layer (Frontend):** Integrates directly with the `@google/genai` SDK on the client side to perform on-demand NLP tasks (summarization, semantic filtering, and multi-document synthesis).
3. **State Management & Caching (Frontend):** Utilizes `@tanstack/react-query` to asynchronously fetch, normalize, and cache the aggregated feed from the backend.
4. **Presentation Layer (Frontend):** A highly optimized React 18 front-end utilizing `motion/react` for fluid transitions, Tailwind CSS for utility-first styling, and a modular component design.
5. **Persistence Layer:** LocalStorage is utilized via custom hooks (`useUserPreferences`) to persist user states, saved bookmarks, and view configurations without requiring a dedicated backend database.

---

## 🧠 Core Concepts & Low-Level Design (LLD)

### 1. State Management & Caching Strategy
* **Server State:** Managed by **React Query**. Implements stale-while-revalidate caching strategies, background refetching, and request deduplication. This ensures the feed feels instantaneous while remaining up-to-date.
* **Client State:** Managed via React Context (`WeeklyBriefContext`) and custom hooks (`useUserPreferences`).
* **Memoization:** Extensive use of `useMemo` and `useCallback` in `App.tsx` and `DiscoverView.tsx` to prevent expensive re-renders during complex array filtering and sorting operations.

### 2. AI Integration Patterns
* **Semantic Smart Filtering:** Instead of relying solely on exact-match RegEx, the app uses a Gemini Flash/Lite model to perform zero-shot classification on the feed items based on natural language queries. It passes a truncated JSON representation of the feed to the LLM and expects an array of relevant indices in return.
* **Streaming Summarization:** The `useSummarizer` hook implements a streaming response pattern. It reads chunks from the Gemini API and updates the UI in real-time, reducing perceived latency for long-form content analysis.
* **Multi-Document Synthesis (Weekly Brief):** Aggregates the week's most critical updates across all categories and feeds them into a larger context window to generate a cohesive, executive-level markdown report.

### 3. Performance Optimizations
* **Route-Level Code Splitting:** Views are lazy-loaded using `React.lazy` wrapped in a custom `lazyWithRetry` HOC. This mitigates `ChunkLoadError` issues caused by network instability or stale caches during deployments.
* **Debouncing:** Search inputs and AI filter triggers are heavily debounced (`useDebounce`) to prevent rate-limiting the LLM API and to reduce unnecessary React Query re-evaluations.
* **Virtualization/Pagination:** The feed implements a "Load More" pagination strategy (`visibleCount` state) to keep the DOM node count low, ensuring smooth scrolling even with hundreds of feed items.
* **Compression & Rate Limiting:** The Express backend uses `compression` for gzip payloads and `express-rate-limit` to prevent abuse.

### 4. Resiliency & Error Handling
* **Global Error Boundaries:** Catches React lifecycle errors and provides fallback UIs with cache-flushing recovery mechanisms.
* **Exponential Backoff:** The backend feed fetcher (`withRetry`) implements exponential backoff for resilient external API calls.
* **Graceful Degradation:** If the AI engine hits a quota limit (429) or fails, the application gracefully falls back to standard keyword-based filtering and disables summarization buttons without breaking the core feed experience.

---

## 🔌 Data Sources & Aggregation Strategy

The backend aggregation engine normalizes data from 17 disparate streams into a unified `FeedItem` interface. It uses `rss-parser` for standard feeds and `cheerio` for HTML scraping when RSS is unavailable or insufficient.

1. **Cloud Blog - Main** (`https://cloudblog.withgoogle.com/rss/`)
2. **Medium Blog** (`https://medium.com/feed/google-cloud`)
3. **Cloud Blog - AI/ML**
4. **Cloud Blog - Data**
5. **Cloud Blog - Databases**
6. **Cloud Blog - Containers**
7. **Cloud Blog - Networking**
8. **Cloud Blog - Security**
9. **Product Updates** (`https://blog.google/products/google-cloud/rss/`)
10. **Press Corner**
11. **Release Notes** (`https://cloud.google.com/feeds/gcp-release-notes.xml`)
12. **Product Deprecations** (HTML Scraped via Cheerio from `https://cloud.google.com/release-notes`)
13. **Security Bulletins** (`https://cloud.google.com/feeds/google-cloud-security-bulletins.xml`)
14. **Architecture Center** (`https://cloud.google.com/feeds/architecture-center-release-notes.xml`)
15. **Google AI Research** (`http://googleaiblog.blogspot.com/atom.xml`)
16. **Gemini Enterprise** (`https://cloud.google.com/feeds/gemini-enterprise-release-notes.xml`)
17. **Google Cloud YouTube** (Enriched via YouTube Data API v3)

---

## 📄 Detailed Pages & Data Sources

The application is composed of several distinct views, each tailored to a specific function and powered by dedicated data sources.

### 1. Discover (`/` - `DiscoverView.tsx`)
* **Function:** The home dashboard providing a personalized, mixed feed of all updates. It features an AI-generated "Weekly Brief" snippet, recent incidents, and a paginated list of all aggregated feed items.
* **Data Sources:** Aggregates *all* available feeds (RSS, HTML scraped, and APIs) via the `/api/feed` and `/api/incidents` backend endpoints.

### 2. Weekly Brief (`/weekly-brief` - `WeeklyBriefView.tsx`)
* **Function:** An executive-level, AI-synthesized report summarizing the most critical updates from the past 7 days. It uses Gemini to categorize and highlight key takeaways.
* **Data Sources:** 
  * All aggregated feeds (filtered to the last 7 days).
  * **AI Processing:** Google Gemini API (`@google/genai`) for synthesis and markdown generation.

### 3. Cloud Blog (`/cloud-blog` - `StandardFeedView.tsx`)
* **Function:** A dedicated view for long-form articles, tutorials, and deep dives from Google Cloud's official blogs.
* **Data Sources:**
  * `https://cloudblog.withgoogle.com/rss/` (Main)
  * `https://medium.com/feed/google-cloud` (Medium)
  * Category-specific RSS feeds (AI/ML, Data Analytics, Databases, Containers, Networking, Security).

### 4. Product Updates (`/updates` - `StandardFeedView.tsx`)
* **Function:** Tracks feature launches, general availability (GA) announcements, and product-specific news.
* **Data Sources:**
  * `https://blog.google/products/google-cloud/rss/`
  * `http://googleaiblog.blogspot.com/atom.xml` (AI Research)

### 5. Release Notes (`/release-notes` - `ReleaseNotesView.tsx`)
* **Function:** A technical, chronological feed of all GCP release notes, crucial for developers tracking specific API or service changes.
* **Data Sources:**
  * `https://cloud.google.com/feeds/gcp-release-notes.xml`

### 6. Service Health (`/incidents` - `IncidentsView.tsx`)
* **Function:** A real-time dashboard tracking active and historical Google Cloud outages, degradations, and service disruptions. Includes duration calculators and easy copy-paste status templates.
* **Data Sources:**
  * `https://status.cloud.google.com/incidents.json` (Fetched via `/api/incidents` backend proxy with 15-minute caching).

### 7. Product Deprecations (`/deprecations` - `ProductDeprecationsView.tsx`)
* **Function:** A proactive planning tool that visualizes upcoming product end-of-life (EOL) and deprecation dates on a chronological timeline.
* **Data Sources:**
  * HTML Scraped via Cheerio from `https://cloud.google.com/release-notes` (Filtered for "deprecation" and "shutdown" keywords).

### 8. Architecture Center (`/architecture` - `ArchitectureView.tsx`)
* **Function:** A feed dedicated to reference architectures, best practices, and enterprise design patterns published by Google.
* **Data Sources:**
  * `https://cloud.google.com/feeds/architecture-center-release-notes.xml`

### 9. Security Bulletins (`/security` - `SecurityView.tsx`)
* **Function:** A critical feed tracking CVEs, security patches, and vulnerability disclosures affecting Google Cloud products.
* **Data Sources:**
  * `https://cloud.google.com/feeds/google-cloud-security-bulletins.xml`

### 10. Google Cloud YouTube (`/youtube` - `YouTubeView.tsx`)
* **Function:** A video feed of the latest tutorials, event keynotes, and developer advocacy content from the official GCP YouTube channel.
* **Data Sources:**
  * `https://www.youtube.com/feeds/videos.xml?channel_id=UCJS9pqu9BzkAMNTmzNMNhvg`
  * Enriched with video thumbnails and descriptions via the **YouTube Data API v3**.

### 11. Tools (`/tools` - `ToolsView.tsx`)
* **Function:** A collection of utility tools for cloud engineers, including an IP Range Finder and a GKE Version Tracker.
* **Data Sources:**
  * **IP Range Finder:** `https://www.gstatic.com/ipranges/cloud.json` (Fetched via `/api/ip-ranges`).
  * **GKE Version Tracker:** XML feeds for Stable, Regular, and Rapid release channels (`https://cloud.google.com/feeds/gke-[channel]-channel-release-notes.xml` fetched via `/api/gke-feed`).

### 12. Saved (`/saved` - `SavedView.tsx`)
* **Function:** A personalized bookmark manager allowing users to save and organize important feed items for later reference.
* **Data Sources:**
  * Browser **LocalStorage** (managed via the `useUserPreferences` hook).

---

## ✨ Key Features Detailed

* **Unified Intelligence Feed:** A single pane of glass for all GCP updates, sorted by relevance, date, or category.
* **AI-Powered "Weekly Brief":** An automated, synthesized executive summary of the week's most impactful changes, generated on-the-fly using Gemini.
* **On-Demand Summarization:** TL;DR generation for lengthy blog posts and release notes, streaming directly into the UI.
* **Smart Filtering:** Natural language search across the entire aggregated dataset (e.g., "Show me database security updates").
* **Customizable Dashboards:** Toggleable columns, grid/list view modes, and category subscriptions stored in LocalStorage.
* **Export Capabilities:** CSV export of filtered datasets for reporting and compliance tracking.
* **Keyboard Navigation:** Power-user friendly with shortcuts (`/` for search, `Cmd+1-9` for view switching).
* **Presentation Mode:** A distraction-free UI mode for sharing updates in team meetings, hiding sidebars and expanding content.
* **Interactive Page Loader:** A dynamic, progress-based loading screen that cycles through informative initialization states.

---

## 🛠️ Technology Stack & Packages

### Frontend (Client)
* **Framework:** React 18 (`react`, `react-dom`)
* **Build Tool:** Vite (`vite`, `@vitejs/plugin-react`)
* **Routing:** React Router DOM v6 (`react-router-dom`)
* **State Management:** TanStack React Query (`@tanstack/react-query`)
* **Styling:** Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`)
* **UI Utilities:** `clsx`, `tailwind-merge`
* **Icons:** Lucide React (`lucide-react`)
* **Animation:** Framer Motion (`motion`)
* **Markdown Rendering:** `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`
* **Data Visualization:** Recharts (`recharts`)
* **Notifications:** Sonner (`sonner`)
* **AI SDK:** Google GenAI (`@google/genai`)
* **Date Formatting:** Date-fns (`date-fns`)
* **Security:** DOMPurify (`dompurify`)

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express.js (`express`, `tsx`)
* **Security:** Helmet (`helmet`), Express Rate Limit (`express-rate-limit`)
* **Performance:** Compression (`compression`)
* **Data Parsing:** RSS Parser (`rss-parser`), Cheerio (`cheerio`)
* **Environment:** Dotenv (`dotenv`)

---

## 📂 Full File Tree Structure

```text
.
├── package.json
├── server.ts                 # Express backend entry point (Aggregator)
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.server.json
├── vite.config.ts
├── index.html                # Vite entry HTML
├── public/
│   ├── favicon.svg
│   └── logo.svg              # GCP Pulse Logo
└── src/
    ├── App.tsx               # Main React component & Routing
    ├── main.tsx              # React DOM render entry
    ├── index.css             # Global Tailwind CSS
    ├── types.ts              # TypeScript Interfaces (FeedItem, AnalysisResult, etc.)
    ├── vite-env.d.ts
    ├── components/           # Reusable UI Components
    │   ├── AIInsightCard.tsx
    │   ├── EmptyState.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── ErrorDisplay.tsx
    │   ├── FeedCard.tsx
    │   ├── GKEVersionTracker.tsx
    │   ├── GlobalErrorBoundary.tsx
    │   ├── GlobalSearch.tsx
    │   ├── IPRangeFinder.tsx
    │   ├── InsightCharts.tsx
    │   ├── ProductDeprecationsLoader.tsx
    │   ├── ProductDeprecationsTimeline.tsx
    │   ├── Sidebar.tsx
    │   ├── SkeletonLoader.tsx
    │   ├── SummaryModal.tsx
    │   ├── UserGuide.tsx
    │   ├── layout/
    │   │   └── AppLayout.tsx
    │   ├── tools/
    │   │   └── ... (Various utility tools)
    │   └── ui/
    │       ├── AILoading.tsx
    │       ├── PageLoader.tsx
    │       ├── Toaster.tsx
    │       └── Tooltip.tsx
    ├── contexts/             # React Contexts
    │   └── WeeklyBriefContext.tsx
    ├── hooks/                # Custom React Hooks
    │   ├── useDebounce.ts
    │   ├── useFeed.ts        # React Query hooks for fetching backend data
    │   ├── useLazyWithRetry.ts
    │   ├── useSummarizer.ts  # Gemini AI streaming logic
    │   └── useUserPreferences.ts # LocalStorage persistence
    ├── lib/
    │   └── queryClient.ts    # React Query configuration
    ├── services/
    │   └── geminiService.ts  # Google GenAI SDK initialization
    ├── utils/
    │   └── index.ts          # Helper functions (extractImage, etc.)
    └── views/                # Route-level Page Components
        ├── ArchitectureView.tsx
        ├── DiscoverView.tsx
        ├── IncidentsView.tsx
        ├── ProductDeprecationsView.tsx
        ├── ReleaseNotesView.tsx
        ├── SavedView.tsx
        ├── SecurityView.tsx
        ├── StandardFeedView.tsx
        ├── ToolsView.tsx
        ├── WeeklyBriefView.tsx
        └── YouTubeView.tsx
```

---

## 🚀 Development & Deployment Setup

### Prerequisites
* Node.js (v18+ recommended)
* A Google Gemini API Key (`GEMINI_API_KEY`)
* A YouTube Data API v3 Key (`YOUTUBE_API_KEY`)

### Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3000
```

### Running Locally

```bash
# Install dependencies
npm install

# Start the development server (runs both Express backend and Vite frontend via tsx)
npm run dev

# Run TypeScript compilation check and Linter
npm run lint
```

### Production Build

The application is designed to be built as a static SPA served by the Express backend.

```bash
# Build the Vite frontend and compile the Express server
npm run build

# Start the production server
npm run start
```

In production mode, the Express server (`server.ts`) automatically detects the `dist/index.html` file and serves the static Vite assets alongside the `/api/*` aggregation routes.
