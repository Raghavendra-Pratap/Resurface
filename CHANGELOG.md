# Changelog

All notable changes to Resurface will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2026-01-18

### Added
- New quick links: Gemini, Docs, Sheets, Slides
- These are also added as default saved pages for new users

### Changed
- Redesigned bottom bar with cleaner, theme-matching style
- Bottom hints bar now blends seamlessly with the dark theme
- Reorganized quick links order (Gemini first, productivity tools grouped)

## [1.0.6] - 2026-01-18

### Added
- Edit and delete buttons for topics and intents in dashboard sidebar
- Hover over any topic or intent to see edit/delete controls

### Changed
- Updated Resurface logo with a modern design across all pages
- Intents are now case-insensitive and unique (no more duplicates)

### Fixed
- Duplicate intents issue - "Read Later" and "read later" are now treated as the same

## [1.0.5] - 2026-01-18

### Added
- Pre-populated default pages for new users:
  - Gmail, YouTube, Drive, Maps, Calendar, Translate, News, Images
- New users see content immediately instead of a blank page
- Search for "gmail", "youtube", etc. now shows saved Google services
- "Quick Access" and "Google" topics created automatically

## [1.0.4] - 2026-01-18

### Changed
- History items are now deduplicated by URL
- Shows visit count badge (e.g., "5×") for repeated visits
- Fetches more history items then deduplicates to show top 5 unique URLs
- Cleaner history list without repetition

## [1.0.3] - 2026-01-18

### Fixed
- Auto-simulate Escape key on new tab load to release URL bar focus
- More aggressive focus strategy for the Resurface search input
- Search box now reliably gets focus when opening a new tab

## [1.0.2] - 2026-01-18

### Added
- Quick access links on new tab page:
  - Gmail, Images, Drive, YouTube, Maps, Calendar, Translate, News
- Google's brand colors for each service icon
- Hover effects for better interactivity

## [1.0.1] - 2026-01-18

### Added
- **Export/Import backup**: Download your data as JSON, restore anytime
- Data stats display in settings (saved pages, topics, intents, size)
- Merge or replace mode for imports

### Fixed
- Automatic database migration from old "tabmind" database to "resurface"
- Data persists safely across extension updates

## [1.0.0] - 2026-01-18

### Added
- **Rebranded from TabMind to Resurface**
- **Omnibox search**: Type `rs <query>` in URL bar to search saved tabs
- **Custom New Tab page**:
  - Unified search for web + saved pages + browser history
  - Keyboard navigation (↑ for history, ↓ for saved items)
  - Direct URL navigation
  - Dynamic keyboard shortcut hints
- **Google Search overlay**: Shows matching saved pages when searching on Google
- **Manual search modal**: Press `⌘+Shift+F` on any page
- **Auto-save improvements**:
  - Saves when tab is closed
  - Saves on Enter or Escape key press
  - Saves when clicking outside the toast

### Core Features
- **One-click save**: Save any tab with `⌘+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux)
- **Auto-context capture**: Captures the search query that led you to the page
- **Smart topic generation**: Auto-generates topics based on page content and domain
- **Multi-select categories**: Tag pages with multiple topics and intents
- **Full dashboard**: Browse, search, and manage all saved items with grid/list views

### Technical
- Built with Chrome Manifest V3
- Uses IndexedDB for local storage (via `idb` library)
- TypeScript + Vite build system
- Zero external UI frameworks (vanilla JS/CSS)

---

## Migration Notes

### From TabMind to Resurface
- The extension will automatically migrate your data from the old "tabmind" database
- No action required - your saved pages are preserved
- The omnibox keyword changed from `tm` to `rs`