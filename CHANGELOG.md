# Changelog

All notable changes to TabMind will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-18

### Added
- **One-click save**: Save any tab with `⌘+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux)
- **Auto-context capture**: Automatically captures the search query that led you to the page
- **Smart topic generation**: Auto-generates topic categories based on page content and domain
- **Intelligent resurfacing**: Shows relevant saved pages when searching for related terms
- **Multi-select categories**: Tag pages with multiple topics and intents
- **Full dashboard**: Browse, search, and manage all saved items
- **Google integration**: Shows hints on Google when you have relevant saved pages
- **Omnibox support**: Type `tm` in address bar to search saved items
- **New tab override**: Quick access to recent saves from new tab page

### Technical
- Built with Manifest V3
- Uses IndexedDB for local storage
- TypeScript + Vite build system
