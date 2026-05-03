# 🎬 JAV MovieManager v2

<p align="center">
  <img src="https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet" alt=".NET 9" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn/ui-latest-000000?style=flat-square&logo=shadcnui" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=flat-square" alt="GPL-3.0 License" />
</p>

<p align="center">
  <strong>A modern Japanese Adult Video (JAV) library manager with built-in web player.</strong><br />
  Rewritten from scratch — .NET 9 + React 18 + Tailwind CSS + DPlayer.
</p>

---

> **This project is a complete rewrite** of [JAV_MovieManager](https://github.com/4evergaeul/JAV_MovieManager) by [@4evergaeul](https://github.com/4evergaeul). The original project was built with .NET 5 + React 17 + Ant Design 4 and relied on PotPlayer for external playback. This v2 rewrites the entire stack to .NET 9 + React 18 + TypeScript + Tailwind CSS + shadcn/ui, replacing PotPlayer with an embedded DPlayer for in-browser video playback.

---

## ⚠️ Disclaimer

This software is designed for managing and browsing **legally obtained** adult video collections stored on your local filesystem. By using this software, you acknowledge that:

- All media managed by this application is stored **locally on your own computer**.
- You are solely responsible for ensuring the content you manage complies with all applicable laws in your jurisdiction.
- This project **does not provide, distribute, or link to any copyrighted or adult content**.
- The developers are not liable for any misuse of this software.

---

## 🤖 AI Creation Statement

This project was developed with the assistance of **AI coding agents** throughout the entire development lifecycle including architecture design, code generation, debugging, and deployment scripting. All AI-generated code was reviewed, tested, and approved by a human developer before being committed to the repository.

---

## ✨ Features

### 📀 Media Library
- **Virtual-scrolled grid** — Browse thousands of movies with smooth 60fps scrolling (react-virtuoso)
- **Blurhash placeholders** — Plex/Jellyfin-style blurred loading images
- **Responsive columns** — 2–6 columns adapting to window width
- **Hover preview** — Framer Motion animated overlays with play button and metadata

### 🔍 Advanced Filtering
- **Multi-dimensional filters** — Actors, genres, tags, directors, studios, cup size
- **Range sliders** — Filter by release year, actor height, actor age
- **Rating & play count** — Find your most-watched or highest-rated content
- **AND/OR mode** — Switch between intersection and union matching
- **Saved filter presets** — Save and reload commonly used filter combinations
- **Right-panel push-in** — Filter panel pushes content aside instead of overlaying

### 🎥 Built-in Video Player
- **DPlayer integration** — Full-featured HTML5 player with H.265/HEVC detection
- **Keyboard shortcuts** — Space (play/pause), ←→ (seek), F (fullscreen), Esc (back)
- **Subtitle support** — Auto-detects `.srt` / `.ass` / `.vtt` files (UTF-8 auto-conversion)
- **Playback history** — Records watch time, progress, and completion percentage
- **Resume playback** — Prompt to resume from where you left off
- **Same-actor recommendations** — Scroll down in the player to discover more films from the same actress

### 📊 Statistics Dashboard
- **Summary cards** — Total movies, total watch time, unique actors, average rating
- **Top charts** — Most-watched actors, genres, and studios (Recharts bar chart)
- **30-day trend** — Daily playback activity (Recharts line chart)
- **GitHub-style heatmap** — Year-round playback activity visualization

### 👤 Actor Browser
- **Photo grid** — Browse actors with local photos
- **Click to filter** — Click any actor to instantly filter the library by that actor
- **Body metrics** — Height, cup size, measurements, and ratings from scraped data

### 🎨 User Experience
- **Three theme modes** — Light, Dark, and System-following
- **Shuffle play** — Fisher-Yates shuffle through your entire collection
- **Toast notifications** — Non-intrusive feedback for all actions
- **Scroll position restoration** — Browser back button returns to where you left off

### ⚙️ Backend
- **NFO metadata scanning** — Import movies from existing `.nfo` files
- **Actor info scraping** — Auto-fetch actor profiles and measurements
- **SQLite database** — Zero-configuration, single-file database
- **HTTP Range streaming** — Efficient video streaming with seek support

---

## 🚀 Quick Start (for Users)

### Prerequisites
- Windows 10/11 (x64)
- A movie directory organized with `.nfo` metadata files
- A web browser (Chrome, Edge, or Firefox recommended)

### Installation

1. Download the latest `publish.zip` from [Releases](https://github.com/cheeemmms/JAV_MovieManager_v2/releases)
2. Extract to any folder (e.g., `D:\JAV_MovieManager\`)
3. Double-click `jav-manager-tray.exe`
4. The application will appear in your system tray — it opens your default browser automatically

### First-Time Setup

1. Open the browser to `http://localhost:5000`
2. Click **Settings** in the navigation bar
3. Enter your **Movie Directory** path (where your `.nfo` files are)
4. Click **Scan** to import your library
5. Wait for the scan to complete — your movies will appear on the home page

### Port Configuration

The default port is `5000`. To change it, edit `api/appsettings.json`:

```json
{
  "ApiSettings": {
    "Urls": "http://localhost:5000"
  }
}
```

---

## 🔄 Updating (for Users)

When a new version is released, follow these steps to update while keeping your database and settings:

1. **Close the application** — Right-click the tray icon → Exit
2. **Download** the new version zip from [Releases](https://github.com/cheeemmms/JAV_MovieManager_v2/releases)
3. **Extract** the new version to a **separate temporary folder** (e.g., `D:\temp\jav-manager-new\`)
4. **Open PowerShell** in your current install folder (Shift+Right Click → "Open PowerShell window here")
5. Run the update script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File update.ps1 -NewVersionPath D:\temp\jav-manager-new
   ```
6. Type `yes` when prompted
7. Restart `jav-manager-tray.exe`

The script automatically preserves your `api\Data\` (database) and `api\Logs\` directories.

### Reset Database

To start fresh (delete all movies, history, and settings):

```powershell
# Close the application first
Remove-Item publish\api\Data\jav-manager.db
# Restart — a new empty database will be created automatically
```

---

## 🛠 Development Setup

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (included with Node.js)

### Clone & Install

```bash
git clone https://github.com/cheeemmms/JAV_MovieManager_v2.git
cd JAV_MovieManager_v2

# Install frontend dependencies
cd jav-manager-web
npm install

# Return to project root
cd ..
```

### Development Mode

Run the backend and frontend simultaneously in two terminals:

```bash
# Terminal 1: Start the API
cd jav-manager-api
dotnet run --launch-profile http

# Terminal 2: Start the dev server
cd jav-manager-web
npm run dev
```

Then open `http://localhost:5173` in your browser. The Vite dev server proxies API requests to the backend.

### Production Build

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

Output is in `publish/` directory:

```
publish/
├── jav-manager-tray.exe     # Desktop tray application
├── update.ps1               # User update script
└── api/
    ├── jav-manager-api.exe  # Backend server
    ├── wwwroot/             # Frontend static files
    ├── *.dll                # .NET assemblies
    ├── Data/                # SQLite database (preserved on update)
    └── Logs/                # Serilog logs (preserved on update)
```

### Code Quality

```bash
# Frontend type check
cd jav-manager-web
npx tsc --noEmit
npx eslint src/

# Backend build check
cd jav-manager-api
dotnet build
```

---

## 📁 Project Structure

```
JAV_MovieManager_v2/
├── jav-manager-api/           # .NET 9 Backend
│   ├── Controllers/           # REST API endpoints
│   ├── Services/              # Business logic
│   ├── Models/                # Entity models & DTOs
│   ├── Data/                  # EF Core DbContext & Migrations
│   └── Program.cs             # Application entry point
│
├── jav-manager-web/           # React 18 Frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── movies/        # MovieGrid, MovieCard, MovieDetail
│   │   │   ├── player/        # VideoPlayer, DPlayerWrapper
│   │   │   ├── filter/        # FilterPanel, ActorSearch, SavedFilters
│   │   │   ├── dashboard/     # StatCards, TopChart, TrendChart, Heatmap
│   │   │   ├── settings/      # SettingsViewer
│   │   │   ├── actors/        # ActorGrid
│   │   │   ├── layout/        # AppLayout, Navbar
│   │   │   └── ui/            # shadcn/ui base components
│   │   ├── services/          # API hooks (TanStack Query)
│   │   ├── stores/            # Zustand stores
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript type definitions
│   └── vite.config.ts
│
├── jav-manager-tray/          # WPF System Tray App
│   └── MainWindow.xaml.cs     # Tray icon + API lifecycle
│
├── build.ps1                  # One-click production build
├── update.ps1                  # User-side update script
└── memory-bank/               # Development documentation
    ├── design-document.md
    ├── architecture.md
    ├── tech-stack.md
    └── Maintenance/           # Ongoing issue tracking
```

---

## 🗄️ Database

The project uses a single-file SQLite database located at `publish/api/Data/jav-manager.db`.

### Core Tables
| Table | Description |
|---|---|
| `Movies` | Film metadata (title, year, poster, file path) |
| `Actors` | Actor profiles (body metrics, ratings) |
| `Genres` / `Tags` | Classification labels |
| `MovieActors` / `MovieGenres` / `MovieTags` | Many-to-many relationships |
| `PlaybackHistory` | Watch history (start time, duration, completion %) |
| `UserSettings` | Key-value application settings |

### Schema Changes

Currently using `EnsureCreated()` — if the database file exists, it is used as-is. Future schema migrations will use EF Core Migrations:

```bash
cd jav-manager-api
dotnet ef migrations add MigrationName
dotnet ef database update
```

---

## ⚠️ Known Issues

- **Browser back button** — Scroll position restores to approximately the correct area but may be off by 1–2 rows
- **H.265/HEVC** — Some browsers (especially Chromium-based on Windows) may not support HEVC hardware decoding. A warning banner will be displayed if detected

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See [LICENSE](LICENSE) for the full text.

Original project [JAV_MovieManager](https://github.com/4evergaeul/JAV_MovieManager) by [@4evergaeul](https://github.com/4evergaeul).

---

<p align="center">
  <sub>Built with ❤️ (and a lot of AI assistance) in 2026</sub>
</p>
