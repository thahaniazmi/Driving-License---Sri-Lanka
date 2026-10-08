# Sri Lanka Driving License Portal & Practice Hub 🇱🇰

An offline-first educational web portal and interactive examination simulator for candidates preparing for the Sri Lanka Department of Motor Traffic (DMT) driving license.

---

## 📁 Project Overview

This folder contains a complete interactive web application designed to guide candidates through every step of getting a driving license in Sri Lanka, alongside a 1:1 simulation of the official written theory exam and a complete gazette road signs library.

### 🌐 Main Pages

1. **[`index.html`](index.html)** - **Master Guide & Start-to-End Procedure**
   - Detailed 6-Phase Official Roadmap (NTMI Medical → DMT Registration → Theory Written Exam → Learner Permit & 3-Month Practice → Practical Driving Trial → Smart Card Issuance).
   - Interactive Document Checklist with local browser save and reset.
   - Government and Driving School Fee Calculator.
   - License Timeline Simulator.
   - Practical Trial Maneuver Guides (Reverse Box, 3-Point Turn, Hill Start, Motorcycle Figure 8).
   - The 8 Critical "Instant-Fail" Faults explained.

2. **[`quiz.html`](quiz.html)** - **1:1 DMT Written Exam Simulator**
   - Exact replica of the official DMT written examination:
     - **40 Multiple-Choice Questions (MCQs)**
     - **60-Minute live countdown timer**
     - **Pass Mark: 30 / 40 (75%)**
   - Features: Question Navigator Palette, Flag for Review, Exam Mode vs Instant-Feedback Practice Mode.
   - Comprehensive Result Breakdown by topic area (Signs, Rules, Speed, Safety, Law).
   - Full question review with correct answers, explanations, and official DMT citations.

3. **[`signs.html`](signs.html)** - **Official Sri Lanka Road Signs Library**
   - **134 Vector SVG Road Signs** locally stored and categorized according to the Motor Traffic Act (Chapter 203) and RDA manual:
     - 49 Danger Warning Signs
     - 26 Prohibitory Signs
     - 10 Restrictive Signs
     - 8 Mandatory Signs
     - 7 Priority Signs
     - 22 Informative & Directional Signs
     - 5 Traffic & Pedestrian Light Signals
     - 4 Road Markings
     - 3 Additional Supplementary Panels
   - Real-time search by sign code (e.g. `DWS-01`, `PHS-04`), title, or meaning.
   - **Interactive 3D Flashcard Study Mode** for memorization and self-testing.
   - Detail modal showing legal meaning, required driver action, shape, and violation consequences.

4. **[`questions.html`](questions.html)** - **Past Questions Bank (100 Questions)**
   - Searchable question bank of 100 authentic past paper questions.
   - Filter by topic or search by keyword.
   - **Interactive Test-On-The-Spot**: click any option on any card to test yourself immediately with sound and explanation feedback.
   - Bookmarking feature to save difficult questions for revision.

---

## 🚀 How to Run the Website

Since the entire application is built using modern web standards with zero external runtime dependencies:

1. Simply double-click [`index.html`](index.html) (or open it with Google Chrome, Microsoft Edge, Firefox, or Safari).
2. The entire application runs **100% offline**.

### 🚸 Synchronizing High-Definition Vector Road Signs (134 SVGs)

The repository includes a dedicated vector synchronizer that queries the **Wikimedia Commons MediaWiki API** (`action=query&prop=imageinfo`) with a polite User-Agent to download authentic, infinite-resolution vector `.svg` road signs directly from official Gazette and RDA standards:

- **Windows One-Click**: Simply double-click [`download_signs.bat`](download_signs.bat) in the project root.
- **Node.js Terminal**: Run:
  ```bash
  node download_signs.js
  ```
The synchronizer will automatically:
- Query official file endpoints in batches of 40.
- Check XML/SVG integrity (`<svg>` tags, non-raster validation).
- Save crisp vector files into `assets/signs/`.

---

## 🏛️ Summary of Official Sri Lankan Licensing Requirements

| Stage | Authority | Key Requirements | Passing Criteria |
| :--- | :--- | :--- | :--- |
| **Phase 1: Medical Exam** | NTMI (National Transport Medical Institute) | Age ≥ 17, NIC, Eye exam, Blood pressure, Hearing | Fitness Certificate (Valid 6 Months) |
| **Phase 2: Registration** | DMT (Werahera / District Office) | Form MTA 6, Birth Certificate, Barcode Photos | Biometrics Enrolled & Gov Fee Paid |
| **Phase 3: Theory Exam** | DMT Examination Hall | 40 MCQs, 60 Minutes | **≥ 30 / 40 (75%)** |
| **Phase 4: Learning Period** | Public Roads | Form MTA 3 (Learner Permit), Red "L" plates, Accompanied by driver licensed ≥ 3 years | Strictly **Minimum 3 Months (90 Days)** |
| **Phase 5: Practical Trial** | DMT Trial Track & Road | Age ≥ 18, Reverse Box, 3-Point Turn, Hill Start, Road drive with Examiner | Zero critical faults |
| **Phase 6: License Issuance** | DMT Department | Temporary Permit (6 months) → Biometric Smart Card | Valid for **8 Years** |

---

## 🗂️ Directory Structure

```
Driving License/
├── index.html               # Main Start-to-End Procedure Portal
├── quiz.html                # 1:1 Written Exam Simulator
├── signs.html               # 134 Road Signs Library & Flashcards
├── questions.html           # 100 Past Questions Bank Explorer
├── 404.html                 # Custom Vercel & Offline 404 Error Page
├── vercel.json              # Vercel Production Deployment & Headers Config
├── package.json             # NPM package scripts & metadata
├── manifest.json            # PWA Web App Manifest
├── sw.js                    # Service Worker for 100% offline edge caching
├── robots.txt               # Search engine crawler instructions
├── sitemap.xml              # XML Sitemap for SEO indexing
├── favicon.svg              # Vector SVG steering wheel favicon
├── questions.json           # Raw JSON Question Bank
├── signs_wiki.json          # Raw JSON Road Signs Data
├── README.md                # Documentation & User Guide
└── assets/
    ├── icons/
    │   └── favicon.svg      # App icon
    ├── css/
    │   └── style.css        # Responsive styling & themes
    ├── js/
    │   ├── app.js           # Theme, audio synthesizer, calculators, checklist, SW
    │   ├── quiz.js          # Exam simulation & timer engine
    │   ├── signs.js         # Road signs filtering & flashcards
    │   ├── questions.js     # Question bank explorer & bookmarking
    │   ├── signs-data.js    # 134 Signs database
    │   └── questions-data.js# 100 Questions database
    └── signs/               # 134 Local SVG Vector Road Signs
```

---

## ☁️ Deploying to Vercel

The portal is 100% optimized for **zero-configuration production deployment on Vercel**:

### 1. Instant Git Import
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select this repository and click **Deploy**.
4. Vercel automatically detects the static site configuration in `vercel.json` and deploys it immediately!

### 2. Vercel CLI Deployment
You can also deploy directly from your local terminal using the Vercel CLI:
```bash
npm i -g vercel
vercel
```
To deploy straight to production:
```bash
vercel --prod
```

### ⚡ What Was Optimized for Vercel:
- **Clean URLs Enabled (`cleanUrls: true`)**: Access `/quiz`, `/signs`, `/questions` without trailing `.html` extensions.
- **Cache-Control Headers**: 1-year immutable caching for static vector SVGs, stylesheets, and scripts (`max-age=31536000, immutable`), maximizing global CDN edge hits and Lighthouse speed scores.
- **Enterprise Security Headers**: Strict `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`, and `Permissions-Policy`.
- **Custom 404 Page (`404.html`)**: Branded "Wrong Turn" error page with quick links back to all learning modules.
- **PWA & Offline Service Worker (`sw.js` & `manifest.json`)**: Automatic local caching for candidates studying on mobile devices in low-connectivity exam waiting areas.
- **SEO & Social Share Readiness**: Open Graph, Twitter Cards, `sitemap.xml`, and `robots.txt` pre-configured.

