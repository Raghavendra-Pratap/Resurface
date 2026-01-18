# Resurface

> Close tabs without fear. Save with context, resurface when relevant.

Resurface is a Chrome extension that helps you manage tab overload by intelligently saving tabs with context and resurfacing them when you need them.

## Features

- **One-click save**: Press `⌘+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux) to save the current tab
- **Auto-context capture**: Automatically captures the search query that led you to the page and related open tabs
- **Smart topic generation**: Auto-generates topic categories based on the page content and domain
- **Intelligent resurfacing**: When you search for related terms, Resurface shows you relevant saved pages
- **Multi-select categories**: Tag pages with multiple topics and intents
- **Full dashboard**: Browse, search, and manage all your saved items
- **Omnibox search**: Type `rs <query>` in the URL bar to quickly search your saved tabs

## Installation

### Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
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
4. Click Save (or wait 5 seconds for auto-save)

### Finding Saved Pages

- **Omnibox search**: Type `rs <query>` in the URL bar to search your saved pages
- **New Tab search**: Open a new tab and search both the web and your saved pages
- **Dashboard**: Click the Resurface icon and select "Open Dashboard" to browse all saved items
- **Google integration**: When searching on Google, Resurface shows an overlay if you have relevant saved pages

## Project Structure

```
resurface/
├── src/
│   ├── background/       # Service worker (storage, commands, topic generation)
│   ├── content/          # Content scripts (toast, dropdown, page extraction)
│   ├── dashboard/        # Dashboard UI
│   ├── newtab/           # Custom new tab page
│   ├── popup/            # Extension popup
│   ├── shared/           # Shared types, utilities, constants
│   └── assets/           # Icons and images
├── public/               # Static files
└── dist/                 # Built extension (generated)
```

## Tech Stack

- **Manifest V3**: Chrome Extension API
- **TypeScript**: Type-safe code
- **Vite**: Build tool with hot reload
- **IndexedDB**: Local storage for saved items
- **Vanilla JS/CSS**: Lightweight UI without frameworks

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + Shift + S` | Save current tab |
| `⌘/Ctrl + Shift + F` | Search saved tabs |
| `Enter` | Confirm save (when toast is open) |
| `Escape` | Save and close toast |

## Data Model

### Saved Item
- URL, title, favicon
- Topics (auto-generated or user-added)
- Intents (user-selected)
- Context (search query, sibling tabs)
- Timestamps

### Topics
- Auto-generated from domain and keywords
- User can create, rename, merge

### Intents
- User-defined purposes: Read Later, Reference, Share, Project

## Distribution & Updates

### Releasing a New Version

1. **Bump the version** (choose one):
   ```bash
   npm run version:patch   # 1.0.0 → 1.0.1 (bug fixes)
   npm run version:minor   # 1.0.0 → 1.1.0 (new features)
   npm run version:major   # 1.0.0 → 2.0.0 (breaking changes)
   ```

2. **Build and package**:
   ```bash
   npm run release
   ```
   This creates `resurface-vX.X.X.zip` ready for distribution.

### Chrome Web Store (Recommended)

The Chrome Web Store provides **automatic updates** to all users.

1. **First-time setup**:
   - Create a [Developer Account](https://chrome.google.com/webstore/devconsole) ($5 one-time fee)
   - Upload `resurface-vX.X.X.zip`
   - Add store listing assets (screenshots, descriptions)
   - Submit for review (takes 1-3 days)

2. **Publishing updates**:
   - Run `npm run release` to create new package
   - Go to Developer Dashboard → Resurface → Package → Upload new package
   - Submit for review
   - Users get updates automatically within 24-48 hours

### Manual Distribution (Team/Private Use)

For sharing with a small team without the Web Store:

**Option A: Share the ZIP file**
1. Run `npm run release`
2. Share `resurface-vX.X.X.zip` (email, Slack, etc.)
3. Recipients:
   - Download and extract the ZIP
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → select extracted folder

**Option B: GitHub Releases**
1. Create a GitHub release with the ZIP attached
2. Users download from releases page
3. Same installation steps as above

> ⚠️ **Note**: Manually installed extensions don't auto-update. Users must manually download and reinstall new versions.

### Version History

Keep track of changes in your releases. Consider adding a `CHANGELOG.md` file.

## Future Plans

- [ ] Cloud sync across devices
- [ ] AI-powered summaries
- [ ] Import from Pocket, Raindrop, OneTab
- [ ] Firefox and Safari support
- [ ] Team sharing features

## License

MIT
