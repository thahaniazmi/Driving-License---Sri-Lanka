---
name: responsive-web-architecture
description: >-
  Use when optimizing web interfaces for multi-device responsiveness, mobile thumb ergonomics,
  print stylesheets, and offline performance. Covers fluid clamp() layout, touch targets,
  printable checklists, and zero-dependency offline resilience.
---

# Responsive Web Architecture, Mobile Ergonomics & Print Craft

This skill guarantees that the web application renders with flawless precision and zero visual glitches across all screen dimensions—from compact budget smartphones to large desktop monitors—while providing dedicated print stylesheets for real-world physical usage.

---

## 1. Responsive Breakpoint Matrix

Follow a unified 4-tier breakpoint system across all stylesheets:
```css
/* Breakpoint Variables & Media Queries */
/* Mobile Portrait:   < 640px  (default mobile-first styles) */
/* Tablet:            640px - 1023px */
/* Desktop:           1024px - 1439px */
/* Large Desktop:     >= 1440px */

@media (min-width: 640px) {  /* sm: Tablet portrait */ }
@media (min-width: 768px) {  /* md: Tablet landscape */ }
@media (min-width: 1024px) { /* lg: Laptop / Desktop */ }
@media (min-width: 1280px) { /* xl: Standard Desktop */ }
@media (min-width: 1536px) { /* 2xl: Ultra-wide / 4K */ }
```

### Mobile Viewport Units
Mobile browsers (Safari on iOS, Chrome on Android) dynamically show and hide their address bars. Always use dynamic viewport units to avoid cut-off bottom buttons:
- Use `min-height: 100dvh;` instead of `100vh;` for full-screen hero and exam layouts.

---

## 2. Mobile Thumb Zone Ergonomics

On screens below 640px, primary actions must remain easily reachable within the lower half of the viewport (the natural thumb arc):
- **Sticky Bottom Action Bar** on mobile during exam sessions: Submit, Previous, Next, and Question Flag buttons pinned to the bottom of the screen.
- **Drawer / Bottom Sheet**: Use slide-up sheets for the 40-question palette on mobile rather than pushing content down infinitely.
- **Back to Top Floating Action**: For long instructional pages like `index.html`, display a smooth floating button in the bottom right corner when scrolled past 400px.

---

## 3. Dedicated Print Stylesheet (`@media print`)

Candidates frequently need to print document checklists before visiting DMT offices or print road sign summary sheets for revision away from screens.

```css
@media print {
  /* Reset to ink-saving high-contrast black and white */
  *, *::before, *::after {
    background: transparent !important;
    color: #000000 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  body {
    font-size: 11pt;
    line-height: 1.4;
    background: #ffffff !important;
  }

  /* Hide interactive web controls, headers, and navigation */
  .site-header,
  .site-footer,
  .nav-controls,
  .theme-toggle,
  .btn-hero-primary,
  .btn-hero-secondary,
  .hero-actions,
  .nav-link,
  #theme-toggle-btn,
  #mobile-menu-toggle,
  .filter-bar,
  .exam-timer-bar,
  .back-to-top {
    display: none !important;
  }

  /* Expand all collapsed accordions and sections for print */
  details, .accordion-body, .checklist-section {
    display: block !important;
  }

  /* Avoid splitting cards or checklists across page boundaries */
  .step-card,
  .procedure-card,
  .checklist-item,
  .sign-card,
  .trial-maneuver-card {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1px solid #cccccc !important;
    margin-bottom: 0.75rem !important;
    padding: 0.5rem !important;
  }

  /* Clean print header */
  .print-header {
    display: block !important;
    text-align: center;
    border-bottom: 2px solid #000000;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
}
```

---

## 4. Offline Zero-Dependency Resilience

1. **Zero External Font / CDN Dependency**:
   - All fonts must rely on system font stacks (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`) with explicit fallbacks for Sinhala and Tamil scripts.
   - All 134 road signs are stored as pure vector SVGs directly inside `assets/signs/`.
2. **Defensive Storage**:
   - Safely catch `QuotaExceededError` or private browsing exceptions when accessing `localStorage`:
   ```javascript
   function safeStorageSet(key, value) {
     try {
       localStorage.setItem(key, JSON.stringify(value));
     } catch (e) {
       console.warn('LocalStorage unavailable or quota exceeded:', e);
     }
   }
   ```
