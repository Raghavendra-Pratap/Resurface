# Resurface

> Close tabs without fear. Save with context, resurface when relevant.

Resurface is a Chrome extension that helps you manage tab overload by intelligently saving tabs with context and resurfacing them when you need them.

## Features

### 💾 Save with Context
- **One-click save**: Press `⌘+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux) to save the current tab
- **Auto-context capture**: Automatically captures the search query that led you to the page and related open tabs
- **Smart topic generation**: Auto-generates topic categories based on the page content and domain
- **Multi-select categories**: Tag pages with multiple topics and intents
- **Auto-save**: Pages are saved automatically when you close the tab, press Enter, or Escape

### 🔍 Intelligent Resurfacing
- **Omnibox search**: Type `rs <query>` in the URL bar to quickly search your saved tabs
- **Custom New Tab page**: Search both the web and your saved pages from a unified search box
- **Browser history integration**: Shows relevant history items (deduplicated with visit counts)
- **Google search overlay**: When searching on Google, see matching saved pages in an overlay
- **Manual search**: Press `⌘+Shift+F` to open a search modal on any page

### 🚀 Quick Access (New Tab)
- **Google Apps shortcuts**: Gmail, Images, Drive, YouTube, Maps, Calendar, Translate, News
- **Smart search**: Type to search saved pages + browser history simultaneously
- **Keyboard navigation**: `↑` for history, `↓` for saved items, `Enter` to open
- **Direct URL navigation**: Type a URL and press Enter to go directly

### 📊 Dashboard
- **Browse all saved items**: Grid or list view
- **Filter by topics and intents**: Quick sidebar navigation
- **Search across everything**: Full-text search of titles, URLs, and context
- **Manage topics and intents**: Create, rename, and organize

### 🔒 Data Safety
- **Export/Import backups**: Download your data as JSON, restore anytime
- **Automatic migration**: Seamlessly migrates data from older versions
- **Data persists across updates**: Your saved pages are never lost during extension updates

## Installation

### From Chrome Web Store (Recommended)
*Coming soon* - Automatic updates included!

### Manual Installation (Developer)

1. Clone this repository:
   ```bash
   git clone https://github.com/Raghavendra-Pratap/Resurface.git
   cd Resurface
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

Run the development server with hot reload:
```bash
npm run dev
```

## Usage

### Saving a Tab

1. Navigate to any page you want to save
2. Press `⌘+Shift+S` (or click the Resurface icon)
3. Review the auto-generated topics and add intents if desired
4. Click Save, press Enter/Escape, or wait 5 seconds for auto-save
5. Closing the tab also saves automatically!

### Finding Saved Pages

| Method | How |
|--------|-----|
| **Omnibox** | Type `rs ` + your query in the URL bar |
| **New Tab** | Open new tab → type in search box |
| **Shortcut** | Press `⌘+Shift+F` on any page |
| **Dashboard** | Click extension icon → "Open Dashboard" |
| **Google** | Search on Google → see overlay with matches |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + Shift + S` | Save current tab |
| `⌘/Ctrl + Shift + F` | Search saved tabs (modal) |
| `↑` / `↓` | Navigate history/saved items (new tab) |
| `Enter` | Open selected item or search Google |
| `Escape` | Save and close toast |

### Data Backup

1. Open Dashboard → Settings (gear icon)
2. Scroll to "Data Management"
3. Click **Export Backup** to download JSON
4. Click **Import Backup** to restore (merge or replace)

## Project Structure

```
resurface/
├── src/
│   ├── background/       # Service worker (storage, commands, topic generation)
│   ├── content/          # Content scripts (toast, overlay, page extraction)
│   ├── dashboard/        # Dashboard UI with settings
│   ├── newtab/           # Custom new tab page
│   ├── popup/            # Extension popup
│   ├── shared/           # Shared types, utilities, constants
│   └── assets/           # Icons and images
├── public/               # Static files
├── dist/                 # Built extension (generated)
└── scripts/              # Build utilities
```

## Tech Stack

- **Manifest V3**: Latest Chrome Extension API
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool with hot reload
- **IndexedDB**: Local storage via `idb` library
- **Vanilla JS/CSS**: Lightweight, no frameworks

## Data Model

### Saved Item
- URL, title, favicon
- Topics (auto-generated or user-added)
- Intents (user-selected)
- Context (search query, sibling tabs)
- Timestamps (saved, last accessed)

### Topics
- Auto-generated from domain and keywords
- Color-coded for visual distinction
- User can create custom topics

### Intents
- Predefined: Read Later, Reference, Share, Project
- User can create custom intents with emoji

## Distribution & Updates

### Releasing a New Version

```bash
# 1. Bump version (choose one)
npm run version:patch   # 1.0.0 → 1.0.1 (bug fixes)
npm run version:minor   # 1.0.0 → 1.1.0 (new features)
npm run version:major   # 1.0.0 → 2.0.0 (breaking changes)

# 2. Build and package
npm run release         # Creates resurface-vX.X.X.zip
```

### Chrome Web Store

1. Create a [Developer Account](https://chrome.google.com/webstore/devconsole) ($5 one-time)
2. Upload `resurface-vX.X.X.zip`
3. Add store listing (screenshots, descriptions)
4. Submit for review (1-3 days)
5. Users get automatic updates!

### Manual Distribution

Share `resurface-vX.X.X.zip` directly:
1. Recipients extract the ZIP
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select folder

> ⚠️ Manual installs don't auto-update

## Version History

| Version | Changes |
|---------|---------|
| v1.0.4 | Deduplicated history with visit counts |
| v1.0.3 | Auto-escape focus fix for search box |
| v1.0.2 | Quick access links (Google Apps) |
| v1.0.1 | Export/Import backup, database migration |
| v1.0.0 | Initial release |

## Future Plans

- [ ] Cloud sync across devices
- [ ] AI-powered summaries
- [ ] Import from Pocket, Raindrop, OneTab
- [ ] Firefox and Safari support
- [ ] Team sharing features
- [ ] Custom quick links

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Made with ❤️ by [Raghavendra Pratap](https://github.com/Raghavendra-Pratap)
