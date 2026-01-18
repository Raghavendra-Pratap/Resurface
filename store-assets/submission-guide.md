# Chrome Web Store Submission Guide

## 📋 Step-by-Step Form Filling

### 1. Product Details

#### Title from package
```
Resurface
```
✅ Already filled

#### Summary from package
```
Close tabs without fear. Save pages with context and resurface them when you search for related topics.
```
✅ Already filled

#### Description* (Required - 16,000 char max)
Copy this into the description field:

```
Resurface helps you manage tab overload by intelligently saving pages with context and resurfacing them when relevant.

✨ KEY FEATURES

💾 SAVE WITH CONTEXT
• One-click save with ⌘+Shift+S (Mac) or Ctrl+Shift+S (Windows)
• Auto-captures the search query that led you to the page
• Smart topic generation based on content and domain
• Auto-saves when you close the tab or press Enter/Escape

🔍 INTELLIGENT RESURFACING
• Type "rs " in the URL bar to search your saved pages
• Custom New Tab with unified search (web + saved + history)
• Google Search overlay shows matching saved pages
• Press ⌘+Shift+F to search from any page

🚀 QUICK ACCESS
• New Tab includes shortcuts to Gemini, Gmail, Drive, Docs, Sheets, Slides, YouTube, Maps, Calendar, Translate
• Browser history with visit counts (deduplicated)
• Keyboard navigation: ↑ for history, ↓ for saved items

📊 FULL DASHBOARD
• Browse all saved items in grid or list view
• Filter by topics and intents
• Create, edit, and delete custom categories
• Export/Import your data anytime

🔒 YOUR DATA IS SAFE
• Export/Import backups anytime
• Data never leaves your browser
• Persists across extension updates
• Automatic migration from previous versions

Perfect for researchers, developers, students, and anyone who opens too many tabs!
```

#### Category*
Select: **Tools** (under PRODUCTIVITY section)

**Note:** "Productivity" is a header, not a selectable category. Choose **"Tools"** which is the best fit for Resurface (tab manager/bookmark extension).

Alternative options if "Tools" isn't available:
- **Workflow & Planning** (also under PRODUCTIVITY)
- **Developer Tools** (if targeting developers)

#### Language*
Select: **English**

---

### 2. Graphic Assets

#### Store icon* (128×128 pixels)
**File to upload:** `src/assets/icons/icon-128.png`

This file is already in your project at:
```
/Users/raghavendra_pratap/Developer/tabmind/src/assets/icons/icon-128.png
```

#### Screenshots* (At least 1 required)
**Format:** 1280×800 or 640×400, JPEG or 24-bit PNG

**How to capture:**
1. Open `store-assets/screenshots.html` in Chrome
2. Right-click on each screenshot → Inspect
3. Press `Cmd+Shift+P` → Type "screenshot" → Select "Capture node screenshot"
4. Save as PNG

**Recommended screenshots:**
1. **New Tab Page** (1280×800) - Shows logo, search bar, quick links
2. **Save Toast** (1280×800) - Shows the save UI on a webpage
3. **Dashboard** (1280×800) - Shows saved items grid view
4. **Google Overlay** (1280×800) - Shows overlay on Google search results

#### Small promo tile (Optional - 440×280)
You can create this later or skip for now.

#### Marquee promo tile (Optional - 1400×560)
You can create this later or skip for now.

---

### 3. Additional Fields

#### Official URL
Select: **None** (or add your GitHub repo if you want)

#### Homepage URL
```
https://github.com/Raghavendra-Pratap/Resurface
```

#### Support URL
```
https://github.com/Raghavendra-Pratap/Resurface/issues
```

#### Mature content
Toggle: **OFF** (No mature content)

---

### 4. Privacy Practices

When you get to the privacy section, use these justifications:

#### storage
```
Required to save your pages, topics, and settings locally in IndexedDB. No data is sent to external servers.
```

#### tabs
```
Required to access the current tab's URL and title when you save a page.
```

#### activeTab
```
Required to extract page content (title, description) when the user actively chooses to save a page.
```

#### scripting
```
Required to inject the save UI toast and Google search overlay on web pages.
```

#### history
```
Required to show relevant browser history in the New Tab search feature.
```

#### Privacy Policy URL
```
https://github.com/Raghavendra-Pratap/Resurface/blob/main/PRIVACY.md
```

---

### 5. Item Support

#### Visibility
- **Public** - Recommended for initial launch
- Or **Unlisted** if you want to test first

---

## 📦 Files You Need

### Required Files:
1. ✅ **Extension ZIP:** `resurface-v1.0.8.zip` (already created)
2. ✅ **Store Icon:** `src/assets/icons/icon-128.png`
3. ⚠️ **Screenshots:** Need to capture from `store-assets/screenshots.html`

### Optional Files:
- Small promo tile (440×280)
- Marquee promo tile (1400×560)
- Promo video (YouTube URL)

---

## ✅ Pre-Submission Checklist

- [ ] Description filled (copy from above)
- [ ] Category selected: Productivity
- [ ] Language selected: English
- [ ] Store icon uploaded (icon-128.png)
- [ ] At least 1 screenshot uploaded
- [ ] Homepage URL: GitHub repo
- [ ] Support URL: GitHub issues
- [ ] Privacy policy URL added
- [ ] All permissions justified
- [ ] Extension ZIP uploaded

---

## 🚀 After Submission

1. **Review Time:** 1-3 business days
2. **Status Updates:** Check Chrome Web Store Developer Dashboard
3. **If Rejected:** Review feedback and resubmit

---

## 💡 Tips

- **Screenshots are crucial** - They're the first thing users see
- **Description matters** - Make it clear and feature-focused
- **Privacy justifications** - Be specific about why each permission is needed
- **Test thoroughly** - Make sure the extension works before submitting

Good luck with your submission! 🎉
