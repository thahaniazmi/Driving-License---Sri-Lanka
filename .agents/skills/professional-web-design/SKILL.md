---
name: professional-web-design
description: >-
  Use when designing, refining, or overhauling web interfaces to achieve a world-class,
  professional aesthetic. Covers visual hierarchy, typography scales, modern color systems,
  card elevation, border craftsmanship, hero sections, and eliminating amateur or generic AI styling.
---

# Professional Web Design & UI Craft

This skill provides the principles, rules, and production-grade techniques required to make web interfaces look exceptionally professional, credible, and aesthetically refined.

---

## 1. Visual Hierarchy & Spacing Rhythm

### The 8-Point Grid Standard
All margins, padding, gaps, and dimensions must follow an 8pt (or 4pt half-step) spatial rhythm:
- Micro spacing: `4px` (0.25rem), `8px` (0.5rem), `12px` (0.75rem)
- Component padding: `16px` (1rem), `24px` (1.5rem), `32px` (2rem)
- Section spacing: `48px` (3rem), `64px` (4rem), `80px` (5rem), `96px` (6rem)

### Avoiding Flat "Wall of Cards"
- Establish a primary visual anchor per section (e.g., an enlarged hero stat, an active progress ring, or a highlighted recommended option).
- Break monotonous card grids with varying card sizes, accent headers, or segmented summaries.
- Apply generous negative space: professional sites feel calm and confident because elements have room to breathe.

---

## 2. Modern Surface & Elevation System

Never rely on single harsh black shadows. Professional interfaces use layered, low-opacity shadows paired with subtle borders.

### Production Shadow Stack (Light Theme)
```css
/* Subtle card resting */
--shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);

/* Standard elevated card */
--shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);

/* Hover lift / floating element */
--shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);

/* Modal dialogs / popovers */
--shadow-xl: 0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.05);
```

### Production Shadow Stack (Dark Theme)
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
```

### 1px Border Craft
- Surface cards must feature a subtle border that defines boundaries against the background.
- In light theme: `border: 1px solid rgba(226, 232, 240, 0.8)` or `#e2e8f0`.
- In dark theme: `border: 1px solid rgba(255, 255, 255, 0.08)` or `#223049`.
- On interactive hover: shift border color to `var(--primary)` with 30% opacity, rather than jumping abruptly.

---

## 3. Typography Hierarchy & Typesetting

### Modular Font Scales
Use fluid typography with CSS `clamp()` so titles scale smoothly from mobile to desktop:
```css
--text-xs:   0.75rem;    /* 12px - badges, metadata, captions */
--text-sm:   0.875rem;   /* 14px - secondary text, buttons, helper notes */
--text-base: 1rem;       /* 16px - body copy, form inputs */
--text-lg:   1.125rem;   /* 18px - card titles, emphasized callouts */
--text-xl:   1.25rem;    /* 20px - subsection headers */
--text-2xl:  1.5rem;     /* 24px - modal headers, section headers */
--text-3xl:  clamp(1.75rem, 3vw, 2rem);     /* 28-32px - page titles */
--text-4xl:  clamp(2rem, 4vw, 2.75rem);     /* 32-44px - hero title */
```

### Typesetting Rules
1. **Line Heights**:
   - Headings: `line-height: 1.15` to `1.25` (tight, authoritative).
   - Body copy: `line-height: 1.6` to `1.7` (effortless readability).
   - Small captions: `line-height: 1.4`.
2. **Letter Spacing**:
   - Large headings: `letter-spacing: -0.025em` (removes looseness).
   - Uppercase badges/tags: `letter-spacing: 0.05em` (adds crisp legibility).
3. **Contrast & Color**:
   - Primary text: `var(--text-main)` (e.g. `#0f172a` in light, `#f8fafc` in dark).
   - Secondary text: `var(--text-muted)` (e.g. `#475569` in light, `#94a3b8` in dark).
   - Never use low-contrast grey on grey that violates WCAG AA (minimum 4.5:1 ratio).

---

## 4. Color Strategy: The 60-30-10 Rule

A professional palette feels disciplined, not rainbow-saturated:
- **60% Dominant Neutral**: Backgrounds, surfaces, canvas (`#f8fafc` / `#0b1120`, `#ffffff` / `#151e32`).
- **30% Structural Secondary**: Borders, card backgrounds, muted text, headers, navigation bars.
- **10% Intentional Accent**: Primary action buttons, active tab indicators, progress highlights, and status tags.

### Semantic Status Cues
- **Success (Pass / Verified)**: Emerald `#059669` (Light) / `#34d399` (Dark).
- **Warning (Notice / Caution)**: Amber `#d97706` (Light) / `#fbbf24` (Dark).
- **Danger (Instant Fail / Required)**: Crimson `#dc2626` (Light) / `#f87171` (Dark).
- **Info (Guidance / Legal Note)**: Indigo `#4f46e5` (Light) / `#818cf8` (Dark).

---

## 5. Component Polish Patterns

### Status Badges & Pills
```css
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: 9999px;
  line-height: 1;
}
.status-pill-success {
  background-color: var(--success-light);
  color: var(--success);
  border: 1px solid rgba(5, 150, 105, 0.2);
}
```

### Stat Metric Blocks
Metric blocks communicate results and key figures with high visual authority:
- Large bold number (`font-size: 2.25rem`, `font-weight: 700`).
- Clear, concise subtitle label (`font-size: 0.8125rem`, `color: var(--text-muted)`).
- Distinct colored top-border or icon container for semantic context.

### Search & Filtering UI
- Search bar with clear search icon, clear button (`×`), and keyboard shortcut badge (`Ctrl+K` or `⌘K`).
- Filter pills with count badges (e.g., `Warning Signs (49)`).
- Instant, zero-flicker filtering with a polite empty-state card when no results match.

---

## 6. Anti-Patterns to Eliminate

1. ❌ **Harsh 100% Black Shadows**: Always use multi-layered shadows with low opacity (<12%).
2. ❌ **Harsh saturated neon backgrounds**: Tint badge backgrounds to 10–15% opacity with high-contrast text.
3. ❌ **Centered Body Paragraphs**: Always left-align multi-line instructional copy for natural eye tracking.
4. ❌ **Inconsistent Border Radii**: Maintain a defined hierarchy (`6px` for small controls, `10px` for buttons/inputs, `16px` for cards, `9999px` for pills).
5. ❌ **Missing Hover/Focus Transitions**: Every clickable element must have a smooth transition (`150ms ease`).
