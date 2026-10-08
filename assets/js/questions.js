// ==========================================================================
// Sri Lanka Driving License Portal - Question Bank Explorer
// ==========================================================================

const QuestionsExplorer = {
  questions: [],
  currentCategory: 'all',
  searchQuery: '',
  showAllAnswers: false,
  bookmarkedOnly: false,
  bookmarks: new Set(),
  interactiveAnswers: {}, // { [id]: selectedOptionIdx }

  init() {
    if (typeof SRI_LANKA_EXAM_QUESTIONS === 'undefined') {
      console.error('SRI_LANKA_EXAM_QUESTIONS dataset not loaded.');
      return;
    }
    this.questions = SRI_LANKA_EXAM_QUESTIONS;

    // Load bookmarks from localStorage
    const saved = JSON.parse(localStorage.getItem('sldl_bookmarks') || '[]');
    this.bookmarks = new Set(saved);

    this.bindControls();
    this.renderQuestions();
    this.updateCounters();
  },

  bindControls() {
    // Search input with debounce to prevent DOM layout thrashing
    const searchInput = document.getElementById('qbank-search-input');
    if (searchInput) {
      let searchTimeout = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.renderQuestions();
        }, 180);
      });
    }

    // Category filter buttons
    const catBtns = document.querySelectorAll('.q-filter-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category || 'all';
        this.bookmarkedOnly = false;
        AudioEngine.playClick();
        this.renderQuestions();
      });
    });

    // Bookmarks only tab
    const bmTab = document.getElementById('qbank-bookmarks-tab');
    if (bmTab) {
      bmTab.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        bmTab.classList.add('active');
        this.bookmarkedOnly = true;
        AudioEngine.playClick();
        this.renderQuestions();
      });
    }

    // Toggle reveal all answers
    const toggleRevealBtn = document.getElementById('toggle-reveal-btn');
    if (toggleRevealBtn) {
      toggleRevealBtn.addEventListener('click', () => {
        this.showAllAnswers = !this.showAllAnswers;
        toggleRevealBtn.textContent = this.showAllAnswers ? 'Hide All Answers' : 'Reveal All Answers';
        AudioEngine.playClick();
        this.renderQuestions();
      });
    }

    // Event delegation for bookmark buttons
    const container = document.getElementById('questions-list-container');
    if (container) {
      container.addEventListener('click', (e) => {
        const bmBtn = e.target.closest('.q-bm-btn');
        if (bmBtn) {
          const qId = bmBtn.dataset.qid;
          if (qId) this.toggleBookmark(qId);
        }
      });
    }
  },

  updateCounters() {
    const totalEl = document.getElementById('qbank-total-count');
    if (totalEl) totalEl.textContent = this.questions.length;
    const bmCountEl = document.getElementById('qbank-bm-count');
    if (bmCountEl) bmCountEl.textContent = this.bookmarks.size;
  },

  toggleBookmark(id) {
    if (this.bookmarks.has(id)) {
      this.bookmarks.delete(id);
    } else {
      this.bookmarks.add(id);
    }
    localStorage.setItem('sldl_bookmarks', JSON.stringify([...this.bookmarks]));
    this.updateCounters();
    AudioEngine.playClick();

    if (this.bookmarkedOnly) {
      this.renderQuestions();
    } else {
      // High-performance in-place button update without rebuilding DOM
      const bmBtn = document.getElementById(`bm-btn-${id}`);
      if (bmBtn) {
        const isBookmarked = this.bookmarks.has(id);
        bmBtn.innerHTML = isBookmarked ? '★ Bookmarked' : '☆ Bookmark';
      }
    }
  },

  selectOption(qId, optIdx) {
    this.interactiveAnswers[qId] = optIdx;
    const q = this.questions.find(item => item.id === qId);
    if (q) {
      if (optIdx === q.answer) {
        AudioEngine.playSuccess();
      } else {
        AudioEngine.playError();
      }
    }
    // High-performance in-place card update
    this.updateQuestionCard(qId);
  },

  updateQuestionCard(qId) {
    const card = document.getElementById(`q-card-${qId}`);
    if (!card) {
      this.renderQuestions();
      return;
    }
    const q = this.questions.find(item => item.id === qId);
    if (!q) return;

    const userSelected = this.interactiveAnswers[qId];
    const letters = ['A', 'B', 'C', 'D'];
    const optionsWrap = card.querySelector('.q-options-wrap');
    if (optionsWrap) {
      optionsWrap.innerHTML = q.options.map((opt, oIdx) => {
        let style = 'padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.92rem;';
        if (oIdx === q.answer) {
          style += ' border-color: var(--success); background: var(--success-light); color: #047857; font-weight: 700;';
        } else if (oIdx === userSelected) {
          style += ' border-color: var(--danger); background: var(--danger-light); color: #b91c1c;';
        }
        return `
          <div class="option-item" style="${style}" onclick="QuestionsExplorer.selectOption('${q.id}', ${oIdx})">
            <div class="option-letter" style="width: 28px; height: 28px; font-size: 0.82rem;">${letters[oIdx]}</div>
            <div style="flex: 1;">${opt}</div>
            ${oIdx === q.answer ? '<span class="badge badge-green" style="font-size: 0.75rem;">Correct</span>' : ''}
          </div>
        `;
      }).join('');
    }

    const rationaleWrap = card.querySelector('.q-rationale-wrap');
    if (rationaleWrap) {
      rationaleWrap.innerHTML = `
        <div class="info-alert" style="margin-top: 1rem; font-size: 0.88rem;">
          <strong>Rationale:</strong> ${q.explanation}
          <div style="margin-top: 0.35rem; font-size: 0.78rem; color: var(--text-muted);">
            <strong>Reference:</strong> ${q.dmtReference || 'DMT Highway Code'}
          </div>
        </div>
      `;
    }
  },

  getFilteredQuestions() {
    return this.questions.filter(q => {
      // Bookmark filter
      if (this.bookmarkedOnly && !this.bookmarks.has(q.id)) {
        return false;
      }

      // Category filter
      if (!this.bookmarkedOnly && this.currentCategory !== 'all') {
        if (!q.category.toLowerCase().includes(this.currentCategory.toLowerCase())) {
          return false;
        }
      }

      // Search filter
      if (this.searchQuery) {
        const text = (q.question || '').toLowerCase();
        const expl = (q.explanation || '').toLowerCase();
        const optionsText = q.options.join(' ').toLowerCase();
        return text.includes(this.searchQuery) || expl.includes(this.searchQuery) || optionsText.includes(this.searchQuery);
      }

      return true;
    });
  },

  renderQuestions() {
    const container = document.getElementById('questions-list-container');
    if (!container) return;

    const filtered = this.getFilteredQuestions();
    const counter = document.getElementById('qbank-showing-count');
    if (counter) counter.textContent = `Showing ${filtered.length} of ${this.questions.length} Questions`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No questions found</h3>
          <p>Try searching for a different keyword or selecting a different topic tab.</p>
        </div>
      `;
      return;
    }

    const letters = ['A', 'B', 'C', 'D'];

    // Single-pass string concatenation for fast rendering
    const cardsHtml = filtered.map(q => {
      const isBookmarked = this.bookmarks.has(q.id);
      const userSelected = this.interactiveAnswers[q.id];
      const hasAnswered = userSelected !== undefined;
      const reveal = this.showAllAnswers || hasAnswered;

      return `
        <div id="q-card-${q.id}" class="tool-card question-bank-item" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge badge-blue">${q.id}</span>
              <span class="badge badge-gray">${q.category}</span>
            </div>
            <button class="btn-icon q-bm-btn" style="width: auto; padding: 0 0.6rem; height: 32px; font-size: 0.8rem; gap: 0.3rem;" id="bm-btn-${q.id}" data-qid="${q.id}">
              ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          </div>

          ${q.signImage ? `
            <div style="max-width: 140px; margin: 0.5rem 0 1rem; padding: 0.5rem; background: var(--bg-main); border: 1px solid var(--border); border-radius: var(--radius-md);">
              <img src="${q.signImage}" alt="Road Sign" width="100" height="80" style="max-height: 100px; object-fit: contain; margin: 0 auto;" loading="lazy">
            </div>
          ` : ''}

          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem;">${q.question}</h3>

          <div class="q-options-wrap" style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem;">
            ${q.options.map((opt, oIdx) => {
              let style = 'padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.92rem;';

              if (reveal) {
                if (oIdx === q.answer) {
                  style += ' border-color: var(--primary); background: rgba(250, 204, 21, 0.16); color: var(--primary); font-weight: 700;';
                } else if (oIdx === userSelected) {
                  style += ' border-color: var(--danger); background: rgba(239, 68, 68, 0.16); color: var(--danger);';
                }
              } else if (oIdx === userSelected) {
                style += ' border-color: var(--primary); background: rgba(250, 204, 21, 0.14); color: var(--text-main);';
              }

              return `
                <div class="option-item" style="${style}" onclick="QuestionsExplorer.selectOption('${q.id}', ${oIdx})">
                  <div class="option-letter" style="width: 28px; height: 28px; font-size: 0.82rem;">${letters[oIdx]}</div>
                  <div style="flex: 1;">${opt}</div>
                  ${reveal && oIdx === q.answer ? '<span class="badge badge-yellow" style="font-size: 0.75rem;">Correct</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="q-rationale-wrap">
            ${reveal ? `
              <div class="info-alert" style="margin-top: 1rem; font-size: 0.88rem;">
                <strong>Rationale:</strong> ${q.explanation}
                <div style="margin-top: 0.35rem; font-size: 0.78rem; color: var(--text-muted);">
                  <strong>Reference:</strong> ${q.dmtReference || 'DMT Highway Code'}
                </div>
              </div>
            ` : `
              <div style="font-size: 0.82rem; color: var(--text-muted); text-align: right; margin-top: 0.5rem;">
                Click any option above to test your answer
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHtml;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  QuestionsExplorer.init();
});
