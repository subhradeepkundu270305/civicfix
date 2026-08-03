<div align="center">

<img src="https://img.shields.io/badge/CivicFix-Public%20Infrastructure%20Portal-6366F1?style=for-the-badge&logo=lightning&logoColor=white" alt="CivicFix Banner" />

# ⚡ CivicFix — Public Infrastructure Reporting Portal

**A full-stack civic-tech web application that bridges the gap between citizens and municipal authorities.**  
Report potholes, broken streetlights, water leaks, and other public infrastructure issues — and track them to resolution in real time.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Live Demo](https://civicfix-one.vercel.app) · [Report a Bug](mailto:subhradeepkundu2005@gmail.com) · [Request a Feature](mailto:subhradeepkundu2005@gmail.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages & Routes](#-pages--routes)
- [API Reference](#-api-reference)
- [Design System](#-design-system)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌆 Overview

**CivicFix** is a government-grade civic infrastructure damage reporting platform built for Indian smart cities. It provides a seamless workflow for citizens to report issues and for municipal officers to triage, assign, and resolve them — all within a beautiful, dark-themed SaaS-quality interface.

The platform features a dual-portal system:
- **Citizen Portal** — Register, log in, submit geo-tagged reports, track issue status, edit mistaken reports, or delete unwanted reports.
- **Authority Command Dashboard** — Admins view real-time glassmorphic analytics, India-wide density heatmaps, SLA overdue trackers, peak reporting hour grids, category breakdown charts, filter/search all submitted issues, update statuses, and manage resolution workflows.

---

## ✨ Key Features

### 🏛️ Citizen Portal
| Feature | Description |
|---|---|
| **User Authentication** | Secure register/login system with role-based access control (citizen vs. admin) |
| **Issue Reporting** | Multi-field report form with category, priority, title, description, and location |
| **Geo-Tagged Location** | Interactive Leaflet map — click, drag pin, or use GPS auto-detect with reverse geocoding via Nominatim |
| **Photo Evidence Upload** | Attach photographic evidence (PNG/JPG, up to 5MB); stored as Base64 data URLs |
| **My Reports Tracker** | Citizens track all submitted reports with live status indicators and progress bars |
| **Report Edit & Delete** | Citizens can edit mistaken report details or safely delete unwanted reports directly from their dashboard |
| **Priority Selection** | 4-tier urgency system: Low · Medium · High · Critical |
| **Issue Categories** | Pothole 🕳️ · Streetlight 💡 · Water Leak 💧 · Footpath 🚶 · Open Drain 🌊 · Other ⚠️ |

### 🛡️ Authority Command Dashboard (Admin)
| Feature | Description |
|---|---|
| **5-Column Glassmorphic KPIs** | Live animated stats: Total Issues, Resolved Rate, Active Repairs, Critical Hazards, and SLA Overdue Alert Card |
| **India-Wide Density Heatmap** | Leaflet + `leaflet.heat` spatial density map rendering Indian metro clusters with zoom-aware radius/blur |
| **Top 5 Hotspots Ranked List** | Ranked hotspot locations with gradient progress indicators |
| **Reported vs. Resolved Trend** | Area chart with interactive **7D / 30D / 90D** range toggle buttons |
| **Category × Status Stacked Bar** | Stacked bar chart segmenting each issue category by status breakdown |
| **Resolution Time Breakdown** | Horizontal bar chart tracking average resolution days per category |
| **First-Response & Rejection Rate** | Triage time KPI + rejection rate analytics with top rejection reason breakdowns |
| **Department Workload** | Horizontal bar chart monitoring open work orders per municipal department/zone |
| **Photo Evidence Coverage** | SVG circular gauge measuring % of submitted reports containing photo proof |
| **Peak Reporting Hours Heatmap** | 7×24 grid matrix (day of week vs hour of day) showing peak reporting time volume density |
| **Advanced Filtering & Search** | Filter by Status, Category, and Priority; full-text search across ID, title, address, reporter |
| **Paginated Issue Table & Modal** | 8 issues per page with animated row transitions and full issue detail/status update modal |

### 🆘 Emergency Connect (SOS)
| Feature | Description |
|---|---|
| **Floating SOS Button** | Always-visible pulsing emergency button with animated glow effect |
| **One-Tap Quick Dial** | Direct `tel:` links for Police (100) and Fire Brigade (101) |
| **Secondary Emergency Numbers** | Ambulance (102) · Disaster Mgmt (108) · Women Safety (1091) |
| **Live Location Map** | Auto-detects GPS coordinates and renders nearest emergency stations on a dark Leaflet map |
| **Nearest Station Listing** | Displays 6 nearest police & fire stations with distance and direct call button |
| **IPC Warning Banner** | Legal notice: false/prank calls are punishable under IPC § 505 |

---

## 🛠️ Tech Stack

### Frontend & Core
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 | React framework with App Router & API Routes |
| [React](https://react.dev) | 19.x | UI component library |
| [TypeScript](https://www.typescriptlang.org) | 5.x | Static type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first styling & responsive layouts |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Glassmorphic animations & page transitions |
| [Lucide React](https://lucide.dev) | 1.28 | Icon library |

### Mapping & Spatial Analytics
| Technology | Version | Purpose |
|---|---|---|
| [Leaflet](https://leafletjs.com) | 1.9.4 | Interactive maps & location selection |
| [Leaflet Heat](https://github.com/Leaflet/Leaflet.heat) | 0.2.0 | Spatial density heatmap visualization layer |
| [Nominatim API](https://nominatim.openstreetmap.org) | — | Free reverse geocoding (coordinates to physical address) |
| [CartoDB Dark Tiles](https://basemaps.cartocdn.com) | — | Dark map tile layer matching Obsidian UI |

### Charts & Visualizations
| Technology | Version | Purpose |
|---|---|---|
| [Recharts](https://recharts.org) | 3.10 | Bar, Stacked Bar, Donut, Area & Trend visualisations |
| [UUID](https://www.npmjs.com/package/uuid) | 14.x | Unique issue ID generation |
| [React Hot Toast](https://react-hot-toast.com) | 2.6 | Toast notification feedback system |

### Backend (Next.js API Routes)
| Route | Method | Purpose |
|---|---|---|
| `/api/auth` | `POST` | User login & registration |
| `/api/issues` | `GET / POST` | Fetch issues / Create issue report |
| `/api/issues/[id]` | `PATCH / DELETE` | Update status & edit issue details / Delete report |
| `/api/upload` | `POST` | Base64 image upload handler |

---

## 📁 Project Structure

```
infra-report/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Toaster, fonts)
│   ├── page.tsx                # Landing/Homepage
│   ├── globals.css             # Global styles & Obsidian design tokens
│   ├── admin/
│   │   ├── login/page.tsx      # Admin login page
│   │   └── dashboard/page.tsx  # Authority management dashboard & analytics
│   ├── citizen/
│   │   ├── login/page.tsx      # Citizen login
│   │   ├── register/page.tsx   # Citizen registration
│   │   ├── report/page.tsx     # Issue submission page
│   │   └── my-reports/page.tsx # Citizen's report tracker & edit/delete modal
│   └── api/
│       ├── auth/route.ts       # Auth API (login/register)
│       ├── issues/
│       │   ├── route.ts        # Issues GET / POST API
│       │   └── [id]/route.ts   # Issues PATCH / DELETE API
│       └── upload/route.ts     # Photo upload API
├── components/
│   ├── Navbar.tsx              # Responsive navigation bar
│   ├── ReportForm.tsx          # Main issue submission form
│   ├── IssueMap.tsx            # Interactive Leaflet map component
│   ├── IssueDetailModal.tsx    # Admin issue detail & status updater
│   ├── EmergencyConnect.tsx    # SOS floating button & emergency modal
│   ├── ReportCard.tsx          # Citizen report card component (Edit/Delete controls)
│   ├── dashboard/              # Authority Dashboard Component Suite
│   │   ├── KpiCardGlass.tsx           # Glassmorphic KPI card with SLA indicators
│   │   ├── PriorityDistribution.tsx   # Recharts donut chart
│   │   ├── CategoryStatusStacked.tsx  # Category x Status stacked bar chart
│   │   ├── ReportedVsResolvedTrend.tsx# 7D/30D/90D interactive area trend chart
│   │   ├── ResolutionTimeBreakdown.tsx# Resolution time horizontal bar chart
│   │   ├── FirstResponseTime.tsx      # Triage response time KPI
│   │   ├── RejectionRate.tsx          # Rejection rate & reasons breakdown
│   │   ├── DepartmentWorkload.tsx     # Department workload horizontal bar chart
│   │   ├── PhotoEvidenceCoverage.tsx  # SVG circular photo coverage gauge
│   │   ├── IndiaHeatmap.tsx           # Leaflet density heatmap component
│   │   ├── TopHotspots.tsx            # Top 5 ranked hotspots list
│   │   ├── PeakReportingHeatmap.tsx   # 7x24 hour reporting grid matrix
│   │   └── shared.ts                  # Shared chart colors & utility functions
├── lib/
│   └── store.ts                # In-memory data store (users & issues)
├── types/
│   ├── index.ts                # Shared TypeScript types & interfaces
│   └── leaflet-heat.d.ts       # Custom type definitions for leaflet.heat
├── data/
│   └── heatmapDummyData.ts     # Geographic point cluster data for density heatmap
├── public/
│   └── india_flag.jpg          # Hero background image
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18.x`
- **npm** `>= 9.x` (or pnpm / yarn)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/subhradeepkundu270305/civicfix.git
cd civicfix

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with hero, stats, features |
| `/citizen/register` | Public | New citizen registration |
| `/citizen/login` | Public | Citizen login |
| `/citizen/report` | Auth (citizen) | Submit a new infrastructure report |
| `/citizen/my-reports` | Auth (citizen) | View, edit, or delete submitted reports |
| `/admin/login` | Public | Municipal authority login |
| `/admin/dashboard` | Auth (admin) | Full authority command & analytics dashboard |

> **Demo Credentials**  
> Admin: Use the pre-seeded admin account from `lib/store.ts`  
> Citizen: Register a new account via `/citizen/register`

---

## 🔌 API Reference

### `POST /api/auth`
Login or Register user.

### `GET /api/issues`
Returns all submitted issues.

### `POST /api/issues`
Submits a new infrastructure issue report.

### `PATCH /api/issues/[id]`
Updates issue status (admin) or updates report details (citizen).

### `DELETE /api/issues/[id]`
Deletes an issue report (citizen/admin).

---

## 🎨 Design System

CivicFix uses a custom **Obsidian Dark** design language:

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#090D16` | Page background |
| `--bg-card` | `#111827` | Card surfaces |
| `--bg-elevated` | `#141C2E` | Table headers, elevated panels |
| `--border` | `#1E293B` | Card & input borders |
| `--accent` | `#6366F1` | Primary indigo accent |
| `--accent-light` | `#818CF8` | Text accents, icons |
| `--text-primary` | `#F1F5F9` | Headings & body text |
| `--text-muted` | `#94A3B8` | Subtext, labels |

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ❤️ for **Smart City India** — bridging citizens and municipal authorities.

**CivicFix** · *Report. Track. Resolve.*

Made by [Subhradeep Kundu](https://github.com/subhradeepkundu270305)

</div>
