---
name: web-accessibility-wcag
description: >-
  Use when auditing, fixing, or enforcing web accessibility (WCAG 2.1 AA/AAA compliance),
  keyboard navigation, screen reader ergonomics, and inclusive UX across all interactive elements.
---

# Web Accessibility & Inclusive Design (WCAG 2.1 AA)

A truly professional website is universally usable by all citizens, including individuals using screen readers, keyboard-only navigation, high-contrast display modes, or mobile assistive devices.

---

## 1. Keyboard Navigation & Focus Rings

Never remove default browser focus rings without providing a superior `:focus-visible` replacement.

### Production Focus Ring Standard
```css
/* Visible high-contrast focus indicator for keyboard users */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
}

/* Remove default focus outline on mouse click when not needed */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip to Main Content Link
Every page must have an accessible skip link as the very first element in the DOM:
```html
<a href="#main-content" class="skip-to-content">
  Skip to main content
</a>
```
```css
.skip-to-content {
  position: absolute;
  top: -100px;
  left: 1rem;
  background: var(--primary);
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  z-index: 9999;
  transition: top 0.2s ease;
}

.skip-to-content:focus {
  top: 1rem;
}
```

---

## 2. Modal Dialog Accessibility & Focus Traps

When opening a modal dialog (e.g. road sign detail modal, exam finish review):
1. **`role="dialog"` and `aria-modal="true"`**: Must be set on the modal container.
2. **`aria-labelledby`**: Point to the modal header title.
3. **Focus Trapping**: Keyboard `Tab` and `Shift+Tab` must cycle exclusively within the modal while open.
4. **Escape Key Dismissal**: Pressing the `Escape` key must immediately close the modal and return focus to the trigger button that opened it.
5. **Body Scroll Lock**: Prevent background scrolling while the modal is open (`overflow: hidden` on `<body>`).

---

## 3. Screen Reader Live Regions & Dynamic Content

Dynamic updates (such as countdown timer, score calculations, and question bookmarking) must be announced to assistive tech:

```html
<!-- For exam timer warnings and test submissions -->
<div id="a11y-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
```

### Screen Reader Only Utility Class (`.sr-only`)
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 4. Color Contrast Ratios (WCAG 2.1 AA)

- **Normal Text (< 18pt or < 14pt bold)**: Minimum contrast ratio of **4.5:1** against the background.
- **Large Text (≥ 18pt or ≥ 14pt bold)**: Minimum contrast ratio of **3.0:1**.
- **Interactive UI Components & Icons**: Minimum contrast ratio of **3.0:1** against adjacent background colors.
- **Form Input Borders**: Must achieve at least **3.0:1** contrast in their unfocused resting state so visually impaired users can identify input fields.

---

## 5. Mobile Touch Target Sizing (WCAG 2.5.5)

- All buttons, links, checkbox items, and option cards must provide a minimum clickable/tap touch target of **44 × 44 CSS pixels**.
- Space adjacent touch targets with at least **8px** clearance to prevent accidental mis-taps on small smartphone screens.

---

## 6. Semantic HTML & Accessible Forms

- Always use real `<button>` elements for actions and `<a>` elements for navigation (never `<div onclick>`).
- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` or explicit `aria-label`.
- All 134 road signs must have accurate, descriptive `alt` texts stating both the sign classification and legal instruction (e.g. `alt="Danger Warning Sign: Sharp Bend to Left (DWS-01)"`).
