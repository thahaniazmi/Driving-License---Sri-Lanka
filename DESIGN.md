---
name: Sri Lanka Driving License Portal
description: Authoritative, offline-first civic licensing portal and exam simulator adhering to Sri Lanka DMT standards and WCAG 2.1 AA.
colors:
  primary: "#0369a1"
  primary-dark: "#075985"
  primary-light: "#e0f2fe"
  accent: "#d97706"
  accent-light: "#fef3c7"
  success: "#059669"
  success-light: "#d1fae5"
  danger: "#dc2626"
  danger-light: "#fee2e2"
  warning: "#ea580c"
  info: "#4f46e5"
  bg-main: "#f8fafc"
  bg-card: "#ffffff"
  bg-card-hover: "#f1f5f9"
  border: "#e2e8f0"
  border-strong: "#cbd5e1"
  text-main: "#0f172a"
  text-muted: "#475569"
  text-light: "#64748b"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  badge-success:
    backgroundColor: "{colors.success-light}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.625rem"
  badge-danger:
    backgroundColor: "{colors.danger-light}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.625rem"
---

## Overview

The Sri Lanka Driving License Portal & Practice Hub is designed as an authoritative, high-trust civic educational web application. It combines official government regulatory precision (Department of Motor Traffic & Road Development Authority) with modern digital product polish.

The visual style communicates legal authority, crystal-clear guidance, and reassuring instructional support for first-time driving candidates navigating an intimidating licensing process.

---

## Colors

The palette balances institutional credibility with clear interactive affordances and accessibility:

- **Dominant Primary (`#0369a1`)**: Deep ocean blue evoking civic authority and public sector credibility.
- **Ceylon Amber (`#d97706`)**: Saffron/amber national accent used for warnings, highlights, and active progress cues.
- **Emerald Pass (`#059669`)**: Used strictly for verified documents, passing scores (≥75%), and completed procedural steps.
- **Crimson Fail (`#dc2626`)**: High-contrast danger cue reserved for instant-disqualification driving trial errors and mandatory warnings.
- **Neutrals**: Crisp slate light theme (`#f8fafc` canvas with `#ffffff` cards) transitioning to deep midnight dark theme (`#0b1120` canvas with `#151e32` cards).

---

## Typography

- **Font Family**: Modern system UI font stack for zero-latency instant offline rendering across Windows, macOS, Android, and iOS.
  - Fallbacks: System fonts with native support for Sinhala (`Noto Sans Sinhala`) and Tamil (`Noto Sans Tamil`) scripts.
- **Scale**:
  - `Display / Hero`: `clamp(2rem, 4vw, 2.75rem)` with tight letter-spacing (`-0.025em`).
  - `Section Headings`: `1.5rem` to `1.875rem` with bold weight (`700`).
  - `Body Copy`: `1rem` (16px) with comfortable `1.6` line-height.
  - `Meta / Badges`: `0.75rem` to `0.875rem` with semi-bold (`600`) weight.

---

## Layout

- **Container Max-Width**: `1200px` centered with fluid horizontal padding (`1rem` on mobile, `2rem` on desktop).
- **Grid Systems**:
  - Hero: Asymmetric 2-column split (value proposition on left, interactive quick stat cards on right).
  - Road Signs Grid: Responsive auto-fill grid (`repeat(auto-fill, minmax(260px, 1fr))`).
  - Question Palette: 8-column compact grid on desktop, collapsible bottom-sheet on mobile.
- **Spacing Rhythm**: Strict 8-point spatial rhythm (`8px`, `16px`, `24px`, `32px`, `48px`).

---

## Elevation & Depth

- **Resting Cards**: Low-opacity layered shadow (`0 1px 2px 0 rgba(15, 23, 42, 0.05)`) paired with a crisp 1px neutral border (`#e2e8f0`).
- **Hover Lift**: Smooth 4px upward translation (`translateY(-4px)`) with expanded elevation shadow (`0 10px 15px -3px rgba(15, 23, 42, 0.08)`).
- **Modals & Overlays**: Deep backdrop blur (`backdrop-filter: blur(8px)`) with floating modal shadow (`0 20px 25px -5px rgba(0, 0, 0, 0.2)`).

---

## Shapes

- **Corner Radii Hierarchy**:
  - Small badges & tooltips: `6px` (`--radius-sm`)
  - Buttons & input fields: `10px` (`--radius-md`)
  - Content cards & containers: `16px` (`--radius-lg`)
  - Hero banners & feature panels: `24px` (`--radius-xl`)
  - Status pills & tag indicators: `9999px` (`--radius-full`)

---

## Components

- **Top National Banner**: Displays national flag motif, official DMT reference text, and offline badge.
- **Phase Timeline Stepper**: Chronological roadmap with circular step numbers, active pulsing states, and completed checkmarks.
- **Document Checklist Card**: Interactive checkbox rows with persistent `localStorage` progress bar.
- **Road Sign Card**: Crisp vector SVG rendering with category color tags, sign codes, and one-click modal detail view.
- **1:1 Exam Simulator Palette**: 40-button navigator indicating unanswered, answered, and flagged review questions.

---

## Do's and Don'ts

### Do's
- Maintain minimum WCAG AA 4.5:1 contrast across all text elements in both light and dark modes.
- Provide immediate visual and tactile feedback on every click and toggle.
- Keep all 134 road signs rendered as pure crisp local vector SVGs.
- Preserve 100% offline functionality with zero external script or CDN dependencies.

### Don'ts
- Never use harsh, saturated black box shadows (`rgba(0, 0, 0, 0.8)`).
- Never allow interactive touch targets smaller than 44 × 44 pixels.
- Never use generic placeholder text or informal terminology—adhere strictly to official Sri Lanka Motor Traffic Act terms.
