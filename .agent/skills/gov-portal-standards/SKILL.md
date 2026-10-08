---
name: gov-portal-standards
description: >-
  Use when building, auditing, or styling government, civic, licensing, or official public service web portals.
  Covers official trust markers, Sri Lankan national branding motifs, trilingual readiness,
  procedural step guides, document checklists, fee calculators, and legal citation callouts.
---

# Government & Civic Portal Design Standards

This skill defines the requirements, patterns, and visual design language for official government, regulatory, and civic licensing portals, adhering to Sri Lanka ICTA standards, international public service guidelines (such as GOV.UK and USWDS), and the Sri Lanka Motor Traffic Act (Chapter 203).

---

## 1. High-Trust Architecture & Credibility Markers

Official public service portals must immediately project trust, legitimacy, and clarity. Candidates often arrive stressed about bureaucratic hurdles and strict deadlines.

### The Official Top Banner
Place an authoritative banner at the very top of the page above the navigation header:
- **Flag / Emblem**: National motif (🇱🇰 Sri Lankan Flag / National Emblem badge).
- **Official Status Text**: "Official Department of Motor Traffic (DMT) & RDA Educational Reference · 100% Free & Offline".
- **Legal Authority**: "Conforming to the Motor Traffic Act (Chapter 203) & RDA Gazette No. 1980/38".

### Legal Citation Badges
Wherever official rules, fees, or penalty criteria are shown, display citation badges:
- `[Act No. 203 § 122]` for driving license eligibility.
- `[Gazette 1980/38]` for road signs and marking classifications.
- `[DMT Form MTA 6]` for application for driving license.
- `[Form MTA 3]` for learner permit.

---

## 2. National Color & Branding Identity

Balance official authority with modern digital elegance:
- **Ceylon Deep Navy / Slate**: `hsl(215, 28%, 17%)` (`#1e293b`) for dominant structural elements, dark mode surfaces, and headers.
- **Sri Lanka Deep Maroon Accent**: `hsl(345, 75%, 28%)` (`#7e1131`) for secondary national badges and ceremonial touches.
- **Ceylon Golden Amber / Saffron**: `hsl(38, 92%, 50%)` (`#f59e0b`) for active steps, highlights, and warning cues.
- **DMT Official Teal / Ocean Blue**: `hsl(201, 96%, 32%)` (`#0369a1`) for interactive links, primary action buttons, and active tabs.
- **NTMI Medical Emerald**: `hsl(160, 84%, 39%)` (`#059669`) for pass states and completed checklist items.

---

## 3. Procedural Stepper & Timeline UX

Licensing involves a mandatory chronological multi-step journey. The interface must guide candidates with zero procedural confusion:

### Phase Stepper Anatomy
1. **Step Indicator Circle**:
   - `Completed`: Solid emerald with white checkmark (`✓`).
   - `Active / In Progress`: Pulsing primary ring with bold number and accent badge.
   - `Upcoming`: Subtle border with muted number.
2. **Phase Metadata**:
   - Step Title (e.g., "Phase 1: NTMI Medical Fitness Examination").
   - Location tag (e.g., `NTMI Nugegoda / District Branches`).
   - Required Forms tag (e.g., `MTA 6`).
   - Estimated Duration badge (e.g., `1–2 Hours`).
3. **Actionable Checklist**:
   - Expandable card detailing exact physical documents to bring.
   - Practical tips (e.g., "Arrive before 7:30 AM; bring 4 passport-size color photos with open ears").

---

## 4. Document Preparation Checklist System

A common point of failure for applicants is arriving at DMT Werahera with missing documents:
- **Interactive Checkboxes**: Users can check off documents as they prepare them at home.
- **Persistent State**: State automatically stored in `localStorage` so refreshing does not wipe progress.
- **Readiness Progress Bar**:
  - `0–50%`: "Documents Incomplete - Review missing items below".
  - `100%`: "All Documents Ready! You are prepared for your appointment."
- **One-Click Reset & Print**: Provide a clean "Reset Checklist" and "Print Checklist" button for physical take-along copies.

---

## 5. Instant-Fail Warning Callouts

The practical driving trial (Hill Start, Reverse Box, 3-Point Turn, Figure 8) features zero-tolerance instant-fail faults:
- **Visual Callout Box**:
  - Distinctive red left border (`4px solid var(--danger)`).
  - High-visibility warning badge: `⚠️ INSTANT DISQUALIFICATION`.
  - Clear explanation: Why the examiner will instantly fail the test (e.g., rolling backwards more than 6 inches on the hill start, touching the curb during the reverse box).
  - "How to Avoid" coaching tip with practical technique guidelines.

---

## 6. Official Fee Calculator Architecture

Transparently clarify all costs so applicants are never surprised:
- Clearly separate:
  1. **Government Statutory Fees** (DMT Application, Written Exam, Learner Permit, Trial Fee, Smart Card Stamp Duty).
  2. **NTMI Medical Test Fee**.
  3. **Optional Driving School Package Fees** (Vehicle rental for trial, practical lessons).
- Interactive selector for vehicle category:
  - Class A / A1 (Motorcycles)
  - Class B (Light Cars / Vans up to 3500kg)
  - Class B1 (Dual-purpose / Three-Wheelers)
  - Combined (Class A + B)

---

## 7. Trilingual Readiness & Official Terminology

Ensure text structure accommodates Sri Lanka's three official languages:
- **English**: Primary instructional language in UI.
- **Sinhala (සිංහල) / Tamil (தமிழ்)**: Secondary subtitles, sign classifications, and script font-family fallbacks:
  `font-family: system-ui, -apple-system, "Noto Sans Sinhala", "Noto Sans Tamil", sans-serif;`
- **Official Terms**:
  - Use exact acronyms: DMT (Department of Motor Traffic / මෝටර් රථ ප්‍රවාහන දෙපාර්තමේන්තුව), NTMI (National Transport Medical Institute / ජාතික ප්‍රවාහන වෛද්‍ය ආයතනය), RDA (Road Development Authority).
  - Location names: Werahera, Narahenpita, Hambantota, Kurunegala, Kandy, Anuradhapura.
