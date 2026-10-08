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
    this.flashcardDeck = [...this.signs];

    this.bindControls();
    this.renderSignsGrid();
    this.renderFlashcard();
    this.updateCounters();
  },

  bindControls() {
    // Search input
    const searchInput = document.getElementById('signs-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderSignsGrid();
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

  renderSignsGrid() {
    const grid = document.getElementById('signs-grid');
    if (!grid) return;

    const filtered = this.getFilteredSigns();
    grid.innerHTML = '';

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

    filtered.forEach(sign => {
      const card = document.createElement('div');
      card.className = 'sign-card';
      
      const badgeClass = this.getBadgeClass(sign.categoryBadge);

      card.innerHTML = `
        <div class="sign-card-code">${sign.id.replace('LK_Road_sign_', '').replace('LK_road_sign_', '')}</div>
        <div class="sign-img-container">
          <img src="${sign.localFile}" alt="${sign.name}" loading="lazy">
        </div>
        <div class="sign-card-title">${sign.name}</div>
        <span class="sign-card-cat badge ${badgeClass}">${sign.categoryBadge || 'Sign'}</span>
      `;

      card.addEventListener('click', () => {
        this.openModal(sign);
        AudioEngine.playClick();
      });

      grid.appendChild(card);
    });
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

    if (modalImg) modalImg.src = sign.localFile;
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

    if (frontImg) frontImg.src = sign.localFile;
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
