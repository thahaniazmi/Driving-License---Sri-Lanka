# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are first-time driving license applicants in Sri Lanka (preparing for Class A motorcycle, Class B light motor vehicle, and Class B1 dual-purpose tricycles/vans). They are navigating the Department of Motor Traffic (DMT) registration, learning road signs, studying for the mandatory 40-question theory written exam, and preparing for the practical trial.

## Product Purpose

Provide an authoritative, all-in-one educational portal and exam simulator that enables candidates to understand the full legal procedure, master road signs, pass the DMT written exam on their first attempt, and avoid instant-fail errors during the practical driving test. Success means zero ambiguity on required paperwork, passing scores in mock exam trials (≥75%), and confident execution of practical driving maneuvers.

## Positioning

Unlike scattered informal forums or ad-heavy third-party test apps, this portal is a self-contained, 100% offline-ready reference based directly on Sri Lanka's Motor Traffic Act (Chapter 203) and official DMT/RDA manuals. It bundles an exact 1:1 timed exam simulator (40 MCQs, 60 minutes, 75% pass mark), 134 authentic vector SVG gazette road signs with flashcard drill modes, and full practical trial breakdown guides.

## Operating Context

- Used on desktop and mobile web browsers across diverse device form factors and internet connectivity qualities across Sri Lanka.
- Designed to function completely offline without active internet connection, external CDNs, or remote servers.
- Candidates use it while preparing documents before visiting DMT offices (Werahera or District Secretariats) and NTMI medical centers, during study sessions, and before scheduled driving trials.

## Capabilities and Constraints

- **Offline-First Zero-Dependency Architecture**: Pure vanilla HTML5, CSS3, and ES6 JavaScript. No bundlers, external runtime dependencies, npm packages, or server requirement; runs directly from local file systems or static hosts.
- **Data Persistence**: Uses browser `localStorage` for document checklist state, question bookmarking, and local theme preference.
- **Audio & Media**: Synthesizer audio cues generated natively via Web Audio API without external audio files.
- **Terminology**: Strictly conforms to official Sri Lankan administrative terms: DMT, NTMI, Werahera, Form MTA 6, Form MTA 3 (Learner Permit), Class A, Class B, Class B1, Gazette signs, Reverse Box, 3-Point Turn, Hill Start, Figure 8.

## Brand Commitments

- **Name**: Sri Lanka Driving License Portal & Practice Hub
- **Voice**: Authoritative, instructional, encouraging, clear, and legally precise.
- **Identity Assets**: National motifs and official Sri Lankan transport iconography, clean road transport color accents.

## Evidence on Hand

- Complete 134 vector SVG road signs stored in `assets/signs/` verified against RDA Gazette classifications.
- 100 authentic past examination questions in `questions.json` and `assets/js/questions-data.js`.
- Gazette sign data and legal meanings in `signs_wiki.json` and `assets/js/signs-data.js`.
- Official 6-phase DMT licensing workflow and fee structures documented in `index.html` and `README.md`.

## Product Principles

1. **Complete Independence**: 100% functionality offline with zero required external network requests or complex toolchains.
2. **Legal & Official Fidelity**: Exact adherence to official DMT scoring formulas (30/40 to pass, 60 minutes) and genuine gazette sign specifications.
3. **Clarity Over Friction**: Eliminate procedural confusion through interactive step-by-step checklists, calculators, and instant-fail explanations.
4. **Accessible Craft**: High-contrast, scannable, responsive typography and controls accessible on low-end mobile devices and large monitors alike.

## Accessibility & Inclusion

- Adherence to WCAG AA contrast standards across both light and dark themes.
- Keyboard-accessible quiz interactions, clear focus states, and semantic HTML hierarchy for screen readers.
- Multi-device responsive readability for candidates studying on smartphones.
