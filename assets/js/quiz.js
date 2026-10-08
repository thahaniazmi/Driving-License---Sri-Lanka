// ==========================================================================
// Sri Lanka Driving License Portal - 1:1 Exam Simulator Engine
// ==========================================================================

const QuizEngine = {
  // State
  mode: 'exam', // 'exam' or 'practice'
  paper: 'random40', // 'random40', 'paper1', 'paper2', 'topic'
  selectedTopic: 'all',
  
  questions: [],
  currentIndex: 0,
  userAnswers: {}, // { [index]: selectedOptionIndex }
  flagged: new Set(),
  
  timerSeconds: 3600, // 60 minutes
  timerInterval: null,
  isFinished: false,

  init() {
    // Check URL parameters (e.g., ?mode=practice&topic=signs)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'practice') {
      this.mode = 'practice';
    }
    if (urlParams.get('topic')) {
      this.selectedTopic = urlParams.get('topic');
      this.paper = 'topic';
    }

    this.bindSetupControls();
    
    // If direct start requested via URL
    if (urlParams.get('start') === '1') {
      this.startExam();
    }
  },

  bindSetupControls() {
    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const modeInput = document.querySelector('input[name="quiz-mode-select"]:checked');
        const paperSelect = document.getElementById('quiz-paper-select');
        const topicSelect = document.getElementById('quiz-topic-select');

        if (modeInput) this.mode = modeInput.value;
        if (paperSelect) this.paper = paperSelect.value;
        if (topicSelect) this.selectedTopic = topicSelect.value;

        AudioEngine.playClick();
        this.startExam();
      });
    }

    // Toggle topic dropdown visibility based on paper selection
    const paperSelect = document.getElementById('quiz-paper-select');
    const topicGroup = document.getElementById('topic-select-group');
    if (paperSelect && topicGroup) {
      paperSelect.addEventListener('change', (e) => {
        if (e.target.value === 'topic') {
          topicGroup.style.display = 'block';
        } else {
          topicGroup.style.display = 'none';
        }
      });
    }

    // Bind keyboard navigation
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('submit-confirm-modal');
      if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') {
          this.closeSubmitModal();
          return;
        }
      }

      if (!this.questions.length || this.isFinished) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        this.nextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        this.prevQuestion();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        this.selectOption(parseInt(e.key) - 1);
      } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
        const map = { a: 0, b: 1, c: 2, d: 3 };
        this.selectOption(map[e.key.toLowerCase()]);
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFlag(this.currentIndex);
      }
    });
  },

  startExam() {
    // Hide setup card, show quiz workspace
    document.getElementById('quiz-setup-card')?.classList.add('hidden');
    document.getElementById('quiz-workspace')?.classList.remove('hidden');
    document.getElementById('quiz-header-bar')?.classList.remove('hidden');
    document.getElementById('quiz-mobile-bottom-bar')?.classList.remove('hidden');

    this.loadQuestions();
    this.currentIndex = 0;
    this.userAnswers = {};
    this.flagged.clear();
    this.isFinished = false;

    this.renderQuestionPalette();
    this.renderCurrentQuestion();

    if (this.mode === 'exam') {
      this.timerSeconds = 3600; // 60 mins
      this.startTimer();
    } else {
      // In practice mode, timer is optional/counter
      const timerEl = document.getElementById('quiz-timer');
      if (timerEl) timerEl.textContent = 'Practice Mode';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  loadQuestions() {
    let pool = [...SRI_LANKA_EXAM_QUESTIONS];

    if (this.paper === 'paper1') {
      // Take first 40 questions
      this.questions = pool.slice(0, 40);
    } else if (this.paper === 'paper2') {
      // Take questions 40 to 80
      this.questions = pool.slice(40, 80);
    } else if (this.paper === 'topic') {
      if (this.selectedTopic !== 'all') {
        pool = pool.filter(q => q.category.toLowerCase().includes(this.selectedTopic.toLowerCase()));
      }
      // Shuffle topic pool
      this.questions = this.shuffle([...pool]).slice(0, 40);
    } else {
      // Default: Balanced 40 randomized questions mimicking real DMT exam
      // DMT proportion:
      // Signs & Markings: ~14
      // Rules & Priority: ~12
      // Speed & Expressways: ~6
      // Vehicle Safety & Mechanics: ~5
      // Legal: ~3
      const signs = this.shuffle(pool.filter(q => q.category === 'Road Signs & Markings')).slice(0, 14);
      const rules = this.shuffle(pool.filter(q => q.category === 'Rules of the Road & Right of Way')).slice(0, 12);
      const speed = this.shuffle(pool.filter(q => q.category === 'Speed Limits & Expressways')).slice(0, 5);
      const safety = this.shuffle(pool.filter(q => q.category === 'Vehicle Safety & Mechanics')).slice(0, 5);
      const legal = this.shuffle(pool.filter(q => q.category === 'Licensing & Legal Regulations')).slice(0, 4);

      const combined = [...signs, ...rules, ...speed, ...safety, ...legal];
      this.questions = this.shuffle(combined);
      if (this.questions.length < 40) {
        // Fallback if category counts short
        this.questions = this.shuffle([...pool]).slice(0, 40);
      }
    }
  },

  shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  startTimer() {
    clearInterval(this.timerInterval);
    const timerEl = document.getElementById('quiz-timer');

    const updateTimer = () => {
      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmit();
        return;
      }
      this.timerSeconds--;
      const mins = Math.floor(this.timerSeconds / 60);
      const secs = this.timerSeconds % 60;
      if (timerEl) {
        timerEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (this.timerSeconds < 300) {
          timerEl.classList.add('urgent');
        }
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  },

  renderCurrentQuestion() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    // Update Counter & Progress Bar
    const qNumEl = document.getElementById('current-q-num');
    const totalQEl = document.getElementById('total-q-count');
    const categoryEl = document.getElementById('current-q-category');
    const progressBar = document.getElementById('quiz-progress-fill');

    if (qNumEl) qNumEl.textContent = `Question ${this.currentIndex + 1}`;
    if (totalQEl) totalQEl.textContent = `of ${this.questions.length}`;
    if (categoryEl) categoryEl.textContent = q.category;
    if (progressBar) {
      const answeredCount = Object.keys(this.userAnswers).length;
      const pct = (answeredCount / this.questions.length) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Flag button state
    const flagBtn = document.getElementById('btn-flag-question');
    if (flagBtn) {
      if (this.flagged.has(this.currentIndex)) {
        flagBtn.classList.add('active');
        flagBtn.innerHTML = '🚩 Flagged';
      } else {
        flagBtn.classList.remove('active');
        flagBtn.innerHTML = '🏳️ Flag for Review';
      }
    }

    // Question Text
    const textEl = document.getElementById('question-text');
    if (textEl) textEl.textContent = q.question;

    // Sign Image Preview (if present)
    const signBox = document.getElementById('question-sign-box');
    if (signBox) {
      if (q.signImage) {
        signBox.style.display = 'flex';
        signBox.innerHTML = `<img src="${q.signImage}" alt="Road Sign" width="120" height="120" loading="lazy">`;
      } else {
        signBox.style.display = 'none';
        signBox.innerHTML = '';
      }
    }

    // Options List
    const optionsContainer = document.getElementById('options-list');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      const selected = this.userAnswers[this.currentIndex];

      q.options.forEach((opt, idx) => {
        const item = document.createElement('div');
        item.className = 'option-item';
        if (selected === idx) item.classList.add('selected');

        // Practice Mode: Show immediate validation
        if (this.mode === 'practice' && selected !== undefined) {
          if (idx === q.answer) {
            item.classList.add('correct');
          } else if (idx === selected) {
            item.classList.add('wrong');
          }
        }

        item.innerHTML = `
          <div class="option-letter">${letters[idx]}</div>
          <div class="option-text" style="flex: 1; font-weight: 500;">${opt}</div>
        `;

        item.addEventListener('click', () => {
          this.selectOption(idx);
        });

        optionsContainer.appendChild(item);
      });
    }

    // Explanation Box (In Practice Mode)
    const expBox = document.getElementById('practice-explanation-box');
    if (expBox) {
      const selected = this.userAnswers[this.currentIndex];
      if (this.mode === 'practice' && selected !== undefined) {
        expBox.style.display = 'block';
        const isRight = selected === q.answer;
        expBox.innerHTML = `
          <div style="font-weight: 700; color: ${isRight ? 'var(--primary)' : 'var(--danger)'}; margin-bottom: 0.35rem;">
            ${isRight ? '✓ Correct Answer!' : '✗ Incorrect Answer'}
          </div>
          <p style="margin-bottom: 0.5rem; color: var(--text-main);">${q.explanation}</p>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            <strong>DMT Reference:</strong> ${q.dmtReference || 'DMT Highway Code'}
          </div>
        `;
      } else {
        expBox.style.display = 'none';
      }
    }

    // Update Navigation Buttons (Desktop)
    const prevBtn = document.getElementById('btn-prev-q');
    const nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
    if (nextBtn) {
      if (this.currentIndex === this.questions.length - 1) {
        nextBtn.innerHTML = 'Review & Finish →';
      } else {
        nextBtn.innerHTML = 'Next →';
      }
    }

    // Update Mobile Sticky Bottom Bar Controls
    const mobilePaletteStatus = document.getElementById('mobile-palette-status');
    if (mobilePaletteStatus) {
      mobilePaletteStatus.textContent = `Q ${this.currentIndex + 1}/${this.questions.length}`;
    }
    const mobilePrevBtn = document.getElementById('mobile-btn-prev-q');
    if (mobilePrevBtn) mobilePrevBtn.disabled = this.currentIndex === 0;

    const mobileNextLabel = document.getElementById('mobile-next-label');
    if (mobileNextLabel) {
      mobileNextLabel.textContent = this.currentIndex === this.questions.length - 1 ? 'Finish' : 'Next';
    }

    const mobileFlagBtn = document.getElementById('mobile-btn-flag-q');
    const mobileFlagIcon = document.getElementById('mobile-flag-icon');
    const mobileFlagLabel = document.getElementById('mobile-flag-label');
    if (mobileFlagBtn) {
      const isFlagged = this.flagged.has(this.currentIndex);
      if (isFlagged) {
        mobileFlagBtn.classList.add('active');
        if (mobileFlagIcon) mobileFlagIcon.textContent = '🚩';
        if (mobileFlagLabel) mobileFlagLabel.textContent = 'Flagged';
      } else {
        mobileFlagBtn.classList.remove('active');
        if (mobileFlagIcon) mobileFlagIcon.textContent = '🏳️';
        if (mobileFlagLabel) mobileFlagLabel.textContent = 'Flag';
      }
    }

    this.updatePaletteButton(this.currentIndex);
  },

  selectOption(idx) {
    if (this.isFinished) return;
    const q = this.questions[this.currentIndex];
    const previous = this.userAnswers[this.currentIndex];

    this.userAnswers[this.currentIndex] = idx;

    if (this.mode === 'practice' && previous === undefined) {
      if (idx === q.answer) {
        AudioEngine.playSuccess();
      } else {
        AudioEngine.playError();
      }
    } else {
      AudioEngine.playClick();
    }

    this.renderCurrentQuestion();
    this.updatePaletteButton(this.currentIndex);
  },

  toggleFlag(index) {
    if (this.flagged.has(index)) {
      this.flagged.delete(index);
    } else {
      this.flagged.add(index);
    }
    AudioEngine.playClick();
    this.renderCurrentQuestion();
    this.updatePaletteButton(index);
  },

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      AudioEngine.playClick();
      this.renderCurrentQuestion();
    }
  },

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      AudioEngine.playClick();
      this.renderCurrentQuestion();
    } else {
      // Reached end, open submit confirmation
      this.openSubmitModal();
    }
  },

  renderQuestionPalette() {
    const palette = document.getElementById('palette-grid');
    if (!palette) return;

    if (!this.paletteBound) {
      palette.addEventListener('click', (e) => {
        const btn = e.target.closest('.palette-btn');
        if (!btn) return;
        const idx = parseInt(btn.dataset.idx, 10);
        if (!isNaN(idx)) {
          this.currentIndex = idx;
          AudioEngine.playClick();
          this.renderCurrentQuestion();
          this.closePaletteDrawer();
        }
      });
      this.paletteBound = true;
    }

    palette.innerHTML = this.questions.map((q, idx) =>
      `<button class="palette-btn" id="palette-btn-${idx}" data-idx="${idx}">${idx + 1}</button>`
    ).join('');

    this.updateAllPaletteButtons();
  },

  togglePaletteDrawer() {
    const col = document.getElementById('palette-column');
    const backdrop = document.getElementById('palette-drawer-backdrop');
    if (!col) return;
    const isOpen = col.classList.toggle('drawer-open');
    if (backdrop) backdrop.classList.toggle('active', isOpen);
    AudioEngine.playClick();
  },

  closePaletteDrawer() {
    document.getElementById('palette-column')?.classList.remove('drawer-open');
    document.getElementById('palette-drawer-backdrop')?.classList.remove('active');
  },

  updatePaletteButton(idx) {
    const btn = document.getElementById(`palette-btn-${idx}`);
    if (!btn) return;

    btn.className = 'palette-btn';
    if (this.currentIndex === idx) btn.classList.add('current');
    if (this.flagged.has(idx)) {
      btn.classList.add('flagged');
    } else if (this.userAnswers[idx] !== undefined) {
      btn.classList.add('answered');
    }
  },

  updateAllPaletteButtons() {
    this.questions.forEach((_, idx) => this.updatePaletteButton(idx));
  },

  openSubmitModal() {
    const modal = document.getElementById('submit-confirm-modal');
    if (!modal) {
      this.finishExam();
      return;
    }

    const answeredCount = Object.keys(this.userAnswers).length;
    const unansweredCount = this.questions.length - answeredCount;
    const flaggedCount = this.flagged.size;

    const summaryText = document.getElementById('modal-submit-summary');
    if (summaryText) {
      summaryText.innerHTML = `
        <div style="margin-bottom: 1rem; font-size: 1rem;">
          You have answered <strong>${answeredCount}</strong> of <strong>${this.questions.length}</strong> questions.
        </div>
        ${unansweredCount > 0 ? `
          <div class="warning-alert" style="margin-bottom: 0.75rem;">
            ⚠️ <strong>${unansweredCount} questions remain unanswered!</strong> Unanswered questions will be scored as incorrect.
          </div>
        ` : ''}
        ${flaggedCount > 0 ? `
          <div class="info-alert" style="margin-bottom: 0.75rem;">
            🚩 You have <strong>${flaggedCount} flagged questions</strong> for review.
          </div>
        ` : ''}
      `;
    }

    modal.classList.add('active');
  },

  closeSubmitModal() {
    document.getElementById('submit-confirm-modal')?.classList.remove('active');
  },

  autoSubmit() {
    alert("Time has expired! Submitting your answers automatically...");
    this.finishExam();
  },

  finishExam() {
    this.closeSubmitModal();
    clearInterval(this.timerInterval);
    this.isFinished = true;

    // Calculate score
    let correct = 0;
    const categoryStats = {};

    this.questions.forEach((q, idx) => {
      const cat = q.category;
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, correct: 0 };
      }
      categoryStats[cat].total++;

      const userChoice = this.userAnswers[idx];
      if (userChoice === q.answer) {
        correct++;
        categoryStats[cat].correct++;
      }
    });

    const total = this.questions.length;
    const scorePct = Math.round((correct / total) * 100);
    const passed = correct >= 30; // DMT standard: 30 / 40 (75%)

    // Hide workspace, show results screen
    document.getElementById('quiz-workspace')?.classList.add('hidden');
    document.getElementById('quiz-header-bar')?.classList.add('hidden');
    document.getElementById('quiz-mobile-bottom-bar')?.classList.add('hidden');
    this.closePaletteDrawer();
    document.getElementById('quiz-results-card')?.classList.remove('hidden');

    if (passed) {
      AudioEngine.playSuccess();
    } else {
      AudioEngine.playError();
    }

    this.renderResults(correct, total, scorePct, passed, categoryStats);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderResults(correct, total, scorePct, passed, categoryStats) {
    // Banner
    const banner = document.getElementById('result-badge-banner');
    if (banner) {
      banner.className = `result-badge-banner ${passed ? 'passed' : 'failed'}`;
      banner.innerHTML = passed 
        ? '<span>🎉</span> <span>PASSED - CONGRATULATIONS!</span>' 
        : '<span>⚠️</span> <span>DID NOT PASS (Pass Mark: 30 / 40)</span>';
    }

    // Score Circle
    const scoreEl = document.getElementById('result-score-display');
    if (scoreEl) {
      scoreEl.innerHTML = `${correct} <span class="total">/ ${total}</span>`;
    }

    const pctEl = document.getElementById('result-percentage');
    if (pctEl) pctEl.textContent = `${scorePct}% Accuracy`;

    // Time Taken
    const timeUsed = 3600 - this.timerSeconds;
    const mins = Math.floor(timeUsed / 60);
    const secs = timeUsed % 60;
    const timeEl = document.getElementById('result-time-taken');
    if (timeEl) timeEl.textContent = `${mins}m ${secs}s`;

    // Category Breakdown Bars
    const catContainer = document.getElementById('result-category-bars');
    if (catContainer) {
      catContainer.innerHTML = '';
      for (const [cat, stats] of Object.entries(categoryStats)) {
        const catPct = Math.round((stats.correct / stats.total) * 100);
        const row = document.createElement('div');
        row.className = 'category-row';
        row.innerHTML = `
          <div class="category-info">
            <span>${cat}</span>
            <span>${stats.correct} / ${stats.total} (${catPct}%)</span>
          </div>
          <div class="category-bar-bg">
            <div class="category-bar-fill" style="width: ${catPct}%; background: ${catPct >= 75 ? 'var(--primary)' : 'var(--danger)'};"></div>
          </div>
        `;
        catContainer.appendChild(row);
      }
    }

    // Render Detailed Review List
    this.renderReviewList('all');
  },

  renderReviewList(filter = 'all') {
    const list = document.getElementById('result-review-list');
    if (!list) return;
    list.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];

    this.questions.forEach((q, idx) => {
      const userChoice = this.userAnswers[idx];
      const isCorrect = userChoice === q.answer;
      const isFlagged = this.flagged.has(idx);

      if (filter === 'wrong' && isCorrect) return;
      if (filter === 'flagged' && !isFlagged) return;

      const item = document.createElement('div');
      item.className = 'tool-card';
      item.style.marginBottom = '1.25rem';
      item.style.borderLeft = `5px solid ${isCorrect ? 'var(--primary)' : 'var(--danger)'}`;

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge ${isCorrect ? 'badge-yellow' : 'badge-red'}">
            ${isCorrect ? '✓ Correct' : '✗ Incorrect'} • Question ${idx + 1}
          </span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${q.category}</span>
        </div>

        ${q.signImage ? `
          <div style="max-width: 120px; margin: 0.5rem 0;">
            <img src="${q.signImage}" alt="Sign" style="max-height: 90px; object-fit: contain;">
          </div>
        ` : ''}

        <h4 style="font-size: 1.1rem; margin-bottom: 1rem;">${q.question}</h4>

        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">
          ${q.options.map((opt, oIdx) => {
            let style = 'padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.9rem;';
            if (oIdx === q.answer) {
              style += ' background: rgba(250, 204, 21, 0.16); color: var(--primary); font-weight: 700; border: 1px solid rgba(250, 204, 21, 0.35);';
            } else if (oIdx === userChoice) {
              style += ' background: rgba(239, 68, 68, 0.16); color: var(--danger); font-weight: 600; text-decoration: line-through; border: 1px solid rgba(239, 68, 68, 0.35);';
            } else {
              style += ' color: var(--text-muted);';
            }
            return `
              <div style="${style}">
                ${letters[oIdx]}. ${opt} ${oIdx === q.answer ? ' (Correct Answer)' : ''} ${oIdx === userChoice && !isCorrect ? ' (Your Choice)' : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="info-alert" style="margin-top: 0.5rem; font-size: 0.88rem;">
          <strong>Explanation:</strong> ${q.explanation}
          <div style="margin-top: 0.25rem; font-size: 0.78rem; color: var(--text-muted);">
            <strong>DMT Reference:</strong> ${q.dmtReference || 'DMT Highway Code'}
          </div>
        </div>
      `;

      list.appendChild(item);
    });
  }
};

// Global Listeners
document.addEventListener('DOMContentLoaded', () => {
  QuizEngine.init();

  // Review filters
  const filterBtns = document.querySelectorAll('.review-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      QuizEngine.renderReviewList(filter);
      AudioEngine.playClick();
    });
  });

  // Modal events
  document.getElementById('btn-submit-exam')?.addEventListener('click', () => {
    QuizEngine.openSubmitModal();
  });
  document.getElementById('modal-cancel-btn')?.addEventListener('click', () => {
    QuizEngine.closeSubmitModal();
  });
  document.getElementById('modal-confirm-submit-btn')?.addEventListener('click', () => {
    QuizEngine.finishExam();
  });
  document.getElementById('submit-confirm-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'submit-confirm-modal') {
      QuizEngine.closeSubmitModal();
    }
  });

  // Nav buttons (Desktop)
  document.getElementById('btn-prev-q')?.addEventListener('click', () => QuizEngine.prevQuestion());
  document.getElementById('btn-next-q')?.addEventListener('click', () => QuizEngine.nextQuestion());
  document.getElementById('btn-flag-question')?.addEventListener('click', () => {
    QuizEngine.toggleFlag(QuizEngine.currentIndex);
  });

  // Nav buttons (Mobile Sticky Bottom Bar)
  document.getElementById('mobile-btn-prev-q')?.addEventListener('click', () => QuizEngine.prevQuestion());
  document.getElementById('mobile-btn-next-q')?.addEventListener('click', () => QuizEngine.nextQuestion());
  document.getElementById('mobile-btn-flag-q')?.addEventListener('click', () => {
    QuizEngine.toggleFlag(QuizEngine.currentIndex);
  });
  document.getElementById('mobile-btn-palette-toggle')?.addEventListener('click', () => {
    QuizEngine.togglePaletteDrawer();
  });

  // Palette drawer close controls
  document.getElementById('palette-drawer-close')?.addEventListener('click', () => {
    QuizEngine.closePaletteDrawer();
  });
  document.getElementById('palette-drawer-backdrop')?.addEventListener('click', () => {
    QuizEngine.closePaletteDrawer();
  });
});
