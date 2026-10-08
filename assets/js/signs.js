// ==========================================================================
// Sri Lanka Driving License Portal - Road Signs Library & Flashcards
// ==========================================================================

const SignsManager = {
  signs: [],
  currentCategory: 'all',
  searchQuery: '',
  
  // Flashcard state
  flashcardIndex: 0,
  flashcardDeck: [],

  init() {
    if (typeof SRI_LANKA_ROAD_SIGNS === 'undefined') {
      console.error('SRI_LANKA_ROAD_SIGNS dataset not loaded.');
      return;
    }
    this.signs = SRI_LANKA_ROAD_SIGNS;
    this.bindControls();

    // Check URL parameters for direct deep-linking
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const catParam = urlParams.get('category');

    if (catParam) {
      this.currentCategory = catParam;
      const matchingTab = document.querySelector(`.filter-tab[data-category="${catParam}"]`);
      if (matchingTab) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        matchingTab.classList.add('active');
      }
    }

    if (modeParam === 'flashcards') {
      const viewGridBtn = document.getElementById('view-grid-btn');
      const viewFlashBtn = document.getElementById('view-flash-btn');
      const gridView = document.getElementById('signs-grid-view');
      const flashView = document.getElementById('signs-flash-view');
      if (viewFlashBtn && flashView) {
        viewGridBtn?.classList.remove('active');
        viewFlashBtn.classList.add('active');
        if (gridView) gridView.style.display = 'none';
        flashView.style.display = 'block';
      }
    }

    this.renderSignsGrid();
    this.renderFlashcard();
    this.updateCounters();
  },

  bindControls() {
    // Search input with debounce to prevent DOM layout thrashing
    const searchInput = document.getElementById('signs-search-input');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.renderSignsGrid();
        }, 150);
      });
    }

    // Grid event delegation for high performance (1 listener instead of 134)
    const grid = document.getElementById('signs-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.sign-card');
        if (!card) return;
        const signId = card.dataset.signId;
        const sign = this.signs.find(s => s.id === signId);
        if (sign) {
          this.openModal(sign);
          AudioEngine.playClick();
        }
      });
      grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.sign-card');
          if (card) {
            e.preventDefault();
            const signId = card.dataset.signId;
            const sign = this.signs.find(s => s.id === signId);
            if (sign) {
              this.openModal(sign);
              AudioEngine.playClick();
            }
          }
        }
      });
    }

    // Category filter tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentCategory = tab.dataset.category || 'all';
        AudioEngine.playClick();
        this.renderSignsGrid();
      });
    });

    // View toggle: Grid vs Flashcards
    const viewGridBtn = document.getElementById('view-grid-btn');
    const viewFlashBtn = document.getElementById('view-flash-btn');
    const gridViewContainer = document.getElementById('signs-grid-view');
    const flashViewContainer = document.getElementById('signs-flash-view');

    if (viewGridBtn && viewFlashBtn) {
      viewGridBtn.addEventListener('click', () => {
        viewGridBtn.classList.add('active');
        viewFlashBtn.classList.remove('active');
        gridViewContainer.style.display = 'block';
        flashViewContainer.style.display = 'none';
        AudioEngine.playClick();
      });

      viewFlashBtn.addEventListener('click', () => {
        viewFlashBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        gridViewContainer.style.display = 'none';
        flashViewContainer.style.display = 'block';
        AudioEngine.playClick();
        this.renderFlashcard();
      });
    }

    // Flashcard interaction
    const flashInner = document.getElementById('flashcard-inner');
    if (flashInner) {
      flashInner.addEventListener('click', () => {
        flashInner.classList.toggle('flipped');
        AudioEngine.playClick();
      });
    }

    document.getElementById('flash-prev-btn')?.addEventListener('click', () => this.prevFlashcard());
    document.getElementById('flash-next-btn')?.addEventListener('click', () => this.nextFlashcard());
    document.getElementById('flash-flip-btn')?.addEventListener('click', () => {
      document.getElementById('flashcard-inner')?.classList.toggle('flipped');
      AudioEngine.playClick();
    });
    document.getElementById('flash-shuffle-btn')?.addEventListener('click', () => {
      this.shuffleFlashcards();
      AudioEngine.playClick();
    });

    // Modal close
    document.getElementById('sign-modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('sign-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'sign-modal-overlay') this.closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const flashView = document.getElementById('signs-flash-view');
      if (flashView && flashView.style.display !== 'none') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          document.getElementById('flashcard-inner')?.classList.toggle('flipped');
          AudioEngine.playClick();
        } else if (e.key === 'ArrowRight') {
          this.nextFlashcard();
        } else if (e.key === 'ArrowLeft') {
          this.prevFlashcard();
        }
      } else if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  },

  updateCounters() {
    const totalEl = document.getElementById('total-signs-count');
    if (totalEl) totalEl.textContent = this.signs.length;
  },

  getFilteredSigns() {
    return this.signs.filter(sign => {
      // Category match
      let matchCat = true;
      if (this.currentCategory !== 'all') {
        const cat = (sign.mainCategory || '').toLowerCase();
        const sec = (sign.section || '').toLowerCase();
        const target = this.currentCategory.toLowerCase();
        matchCat = cat.includes(target) || sec.includes(target);
      }

      // Search query match
      let matchSearch = true;
      if (this.searchQuery) {
        const name = (sign.name || '').toLowerCase();
        const id = (sign.id || '').toLowerCase();
        const meaning = (sign.meaningType || '').toLowerCase();
        matchSearch = name.includes(this.searchQuery) || id.includes(this.searchQuery) || meaning.includes(this.searchQuery);
      }

      return matchCat && matchSearch;
    });
  },

  CATEGORY_EXPLAINERS: {
    'Warning': {
      title: 'Class 1: Danger Warning Signs (49 Signs)',
      desc: '<strong>Equilateral Triangle (Apex Upward) with red border and yellow/white background.</strong> Alerts motorists of immediate road hazards ahead (sharp curves, steep slopes, school crossings, unguarded railway lines). Drivers are legally required to ease off the accelerator, maintain lane position, and prepare to stop or give way.',
      icon: '⚠️'
    },
    'Prohibitory': {
      title: 'Class 2: Prohibitory Signs (26 Signs)',
      desc: '<strong>Circular with red border and white/blue background with red diagonal slash.</strong> Negative legal orders prohibiting specific movements or vehicle types (No Entry, No U-Turn, No Overtaking, No Parking, No Horn). Disobedience constitutes a strict liability traffic offense.',
      icon: '🚫'
    },
    'Restrictive': {
      title: 'Class 3: Restrictive Signs & Speed Limits (10 Signs)',
      desc: '<strong>Circular with red border containing black numerals.</strong> Sets absolute statutory maximum speed limits across Sri Lanka: 50 km/h in built-up/urban areas, 70 km/h on non built-up open roads, 100 km/h on Expressways, and 40 km/h for three-wheelers.',
      icon: '🛑'
    },
    'Mandatory': {
      title: 'Class 4: Mandatory Signs (8 Signs)',
      desc: '<strong>Circular with deep blue background and white symbols.</strong> Positive legal commands telling drivers what they MUST do (Turn Left, Keep Left, Roundabout, Proceed Straight). Following alternative paths is illegal.',
      icon: '🔵'
    },
    'Priority': {
      title: 'Class 5: Priority & Right-of-Way Signs (7 Signs)',
      desc: '<strong>Distinctive geometric shapes (Octagon STOP, Inverted Triangle Give Way, Diamond Priority Road).</strong> Designed to be instantly recognizable even from behind or when obscured by weather, dictating who has right-of-way at intersections.',
      icon: '🛑'
    },
    'Informative': {
      title: 'Class 6: Directional & Informative Signs (22 Signs)',
      desc: '<strong>Rectangular boards. Green for Expressways and Class-A trunk roads; Blue for Provincial roads and driver amenities</strong> (Parking, Fuel, Hospitals, Distances). Directs drivers safely to destinations.',
      icon: 'ℹ️'
    },
    'Traffic': {
      title: 'Class 7A: Traffic Light Signals (5 Signals)',
      desc: '<strong>Automated electronic optical signals.</strong> Red means complete stop behind the stop line; Red+Amber prepares to move; Green allows moving forward if intersection is clear; steady Amber requires stopping unless dangerously close to the line.',
      icon: '🚦'
    },
    'Markings': {
      title: 'Class 7B: Road Markings (4 Primary Markings)',
      desc: '<strong>Longitudinal and transverse painted road markings.</strong> Continuous solid white line forbids crossing or straddling; Double solid white lines carry strict liability prohibition; Yellow Box junction requires a completely clear exit before entering.',
      icon: '🛣️'
    }
  },

  renderSignsGrid() {
    const grid = document.getElementById('signs-grid');
    if (!grid) return;

    // Update Category Explainer Banner
    const explainerBox = document.getElementById('category-explainer-box');
    if (explainerBox) {
      const info = this.CATEGORY_EXPLAINERS[this.currentCategory];
      if (info && !this.searchQuery) {
        explainerBox.style.display = 'block';
        explainerBox.innerHTML = `
          <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
            <span style="font-size: 1.6rem; line-height: 1;">${info.icon}</span>
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-main);">${info.title}</h4>
              <p style="margin: 0; font-size: 0.88rem; color: var(--text-muted); line-height: 1.5;">${info.desc}</p>
            </div>
          </div>
        `;
      } else {
        explainerBox.style.display = 'none';
      }
    }

    const filtered = this.getFilteredSigns();
    const counter = document.getElementById('filtered-signs-count');
    if (counter) counter.textContent = `Showing ${filtered.length} of ${this.signs.length} Signs`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No road signs found</h3>
          <p>Try searching for a different keyword or choose another category tab.</p>
        </div>
      `;
      return;
    }

    // High performance single-pass HTML injection
    const htmlParts = filtered.map(sign => {
      const badgeClass = this.getBadgeClass(sign.categoryBadge);
      const code = sign.id.replace('LK_Road_sign_', '').replace('LK_road_sign_', '');
      const fallbackUrl = sign.imgUrl || '';
      return `
        <div class="sign-card" data-sign-id="${sign.id}" tabindex="0" role="button" aria-label="${sign.name} (${code})">
          <div class="sign-card-code">${code}</div>
          <div class="sign-img-container">
            <img src="${sign.localFile}" alt="${sign.name}" width="100" height="100" loading="lazy" decoding="async" onerror="this.onerror=null; if('${fallbackUrl}') this.src='${fallbackUrl}';">
          </div>
          <div class="sign-card-title">${sign.name}</div>
          <span class="sign-card-cat badge ${badgeClass}">${sign.categoryBadge || 'Sign'}</span>
        </div>
      `;
    });

    grid.innerHTML = htmlParts.join('');
  },

  getBadgeClass(badge) {
    switch (badge) {
      case 'Warning': return 'badge-amber';
      case 'Prohibitory': return 'badge-red';
      case 'Restrictive': return 'badge-red';
      case 'Mandatory': return 'badge-blue';
      case 'Priority': return 'badge-green';
      default: return 'badge-gray';
    }
  },

  openModal(sign) {
    const overlay = document.getElementById('sign-modal-overlay');
    if (!overlay) return;

    const modalImg = document.getElementById('modal-sign-img');
    const modalCode = document.getElementById('modal-sign-code');
    const modalTitle = document.getElementById('modal-sign-title');
    const modalCategory = document.getElementById('modal-sign-cat');
    const modalMeaning = document.getElementById('modal-sign-meaning');
    const modalShape = document.getElementById('modal-sign-shape');

    if (modalImg) {
      modalImg.onerror = () => {
        if (sign.imgUrl) modalImg.src = sign.imgUrl;
      };
      modalImg.src = sign.localFile;
      modalImg.decoding = 'async';
    }
    if (modalCode) modalCode.textContent = sign.id.replace('LK_Road_sign_', '').replace('LK_road_sign_', '');
    if (modalTitle) modalTitle.textContent = sign.name;
    if (modalCategory) modalCategory.textContent = sign.mainCategory;
    if (modalMeaning) modalMeaning.textContent = sign.meaningType;
    if (modalShape) modalShape.textContent = sign.shape || 'Standard Traffic Device';

    overlay.classList.add('active');
  },

  closeModal() {
    document.getElementById('sign-modal-overlay')?.classList.remove('active');
  },

  // Flashcards Mode
  renderFlashcard() {
    if (!this.flashcardDeck.length) return;
    const sign = this.flashcardDeck[this.flashcardIndex];
    if (!sign) return;

    const flashInner = document.getElementById('flashcard-inner');
    if (flashInner) flashInner.classList.remove('flipped');

    const frontImg = document.getElementById('flash-front-img');
    const frontCode = document.getElementById('flash-front-code');
    const backTitle = document.getElementById('flash-back-title');
    const backCategory = document.getElementById('flash-back-cat');
    const backMeaning = document.getElementById('flash-back-meaning');
    const backShape = document.getElementById('flash-back-shape');
    const progressEl = document.getElementById('flash-progress-text');

    if (frontImg) {
      frontImg.onerror = () => {
        if (sign.imgUrl) frontImg.src = sign.imgUrl;
      };
      frontImg.src = sign.localFile;
      frontImg.decoding = 'async';
    }
    if (frontCode) frontCode.textContent = sign.id.replace('LK_Road_sign_', '').replace('LK_road_sign_', '');
    if (backTitle) backTitle.textContent = sign.name;
    if (backCategory) backCategory.textContent = sign.mainCategory;
    if (backMeaning) backMeaning.textContent = sign.meaningType;
    if (backShape) backShape.textContent = sign.shape;
    if (progressEl) progressEl.textContent = `Card ${this.flashcardIndex + 1} of ${this.flashcardDeck.length}`;
  },

  nextFlashcard() {
    if (this.flashcardIndex < this.flashcardDeck.length - 1) {
      this.flashcardIndex++;
    } else {
      this.flashcardIndex = 0; // Loop back
    }
    AudioEngine.playClick();
    this.renderFlashcard();
  },

  prevFlashcard() {
    if (this.flashcardIndex > 0) {
      this.flashcardIndex--;
    } else {
      this.flashcardIndex = this.flashcardDeck.length - 1;
    }
    AudioEngine.playClick();
    this.renderFlashcard();
  },

  shuffleFlashcards() {
    for (let i = this.flashcardDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.flashcardDeck[i], this.flashcardDeck[j]] = [this.flashcardDeck[j], this.flashcardDeck[i]];
    }
    this.flashcardIndex = 0;
    this.renderFlashcard();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SignsManager.init();
});
