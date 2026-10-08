---
name: web-micro-interactions
description: >-
  Use when adding fluid animations, tactile feedback, micro-interactions, sound cues,
  and interactive delight to web interfaces. Covers hardware-accelerated CSS transitions,
  Web Audio API sound synthesizers, interactive quiz feedback, and celebrating milestones without performance loss.
---

# Web Micro-Interactions, Tactile Feedback & Animation

This skill outlines how to turn static web pages into responsive, tactile, and highly engaging digital products that feel fluid, responsive, and delightful under finger or mouse.

---

## 1. Physics-Based Motion & Easing Curves

Never use default `linear` or sluggish `ease-in` for UI components. Natural motion accelerates quickly and decelerates with a gentle cushion.

### Recommended Easing Token Stack
```css
:root {
  /* Snappy spring-like entrance & interactions */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Smooth standard transition */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Quick exit */
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 180ms;
  --duration-normal: 280ms;
  --duration-slow: 450ms;
}
```

---

## 2. Interactive Tactile Button & Card Feedback

### Button Press Physics
When a user clicks or taps a button, it should visually compress:
```css
.btn-interactive {
  transition: transform var(--duration-fast) var(--ease-spring),
              box-shadow var(--duration-fast) var(--ease-spring),
              background-color var(--duration-fast) ease;
  will-change: transform;
}

.btn-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-interactive:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: var(--shadow-sm);
}
```

### Card Liftoff
Interactive cards (such as road signs or quiz options) should elevate subtly on hover:
```css
.card-interactive {
  transition: transform var(--duration-normal) var(--ease-spring),
              box-shadow var(--duration-normal) var(--ease-spring),
              border-color var(--duration-normal) ease;
}

.card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--primary-rgb), 0.35);
}
```

---

## 3. Road Sign 3D Flashcard Flip

For road sign study modes, implement smooth hardware-accelerated 3D card flips:
```css
.flashcard-scene {
  perspective: 1200px;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s var(--ease-spring);
}

.flashcard-scene.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius-lg);
}

.flashcard-back {
  transform: rotateY(180deg);
}
```

---

## 4. Zero-Dependency Web Audio Synthesizer

Audio cues elevate confidence and engagement without requiring heavy external MP3/WAV files. Use the browser's native Web Audio API oscillators:

```javascript
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  // Subtle tactile tap for buttons and option clicks
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Pleasant major chord chime for passing score (≥75%)
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
    });
  }

  // Gentle low double-pulse for instant-fail alerts or wrong answers
  playWarning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}
```

---

## 5. Milestone Celebrations (Confetti Canvas)

When a user passes the exam simulator (≥ 30/40) or marks 100% of their document checklist ready, trigger a lightweight canvas-based confetti particle explosion:
- Run with `requestAnimationFrame` for 60fps smoothness.
- Fade out particles over 3 seconds.
- Automatically clean up the canvas to free GPU memory.

---

## 6. Motion Accessibility (Prefers-Reduced-Motion)

Always respect operating system accessibility preferences. If a user has enabled reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
