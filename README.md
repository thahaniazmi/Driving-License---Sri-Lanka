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

Since the entire application is built using modern standards with zero external runtime dependencies:

1. Simply double-click [`index.html`](index.html) (or open it with Google Chrome, Microsoft Edge, Firefox, or Safari).
2. All 134 road signs are stored locally in `assets/signs/`, so the entire application works **100% offline without requiring an active internet connection**.

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
├── questions.json           # Raw JSON Question Bank
├── signs_wiki.json          # Raw JSON Road Signs Data
├── README.md                # Documentation & User Guide
└── assets/
    ├── css/
    │   └── style.css        # Responsive styling & themes
    ├── js/
    │   ├── app.js           # Theme, audio synthesizer, calculators, checklist
    │   ├── quiz.js          # Exam simulation & timer engine
    │   ├── signs.js         # Road signs filtering & flashcards
    │   ├── questions.js     # Question bank explorer & bookmarking
    │   ├── signs-data.js    # 134 Signs database
    │   └── questions-data.js# 100 Questions database
    └── signs/               # 134 Local SVG Vector Road Signs
```
