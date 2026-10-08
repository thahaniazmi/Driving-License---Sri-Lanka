// ==========================================================================
// Sri Lanka Driving License Portal - Core Application JS
// ==========================================================================

// Global Audio Engine (Web Audio API, no external audio files required)
const AudioEngine = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch(e) {}
  },

  playError() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch(e) {}
  },

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch(e) {}
  }
};

// Theme Management
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('sldl_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        AudioEngine.playClick();
      });
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sldl_theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
};

// Interactive Fee Calculator
const FeeCalculator = {
  fees: {
    // NTMI Medical
    medical: 1750,
    // DMT Government registration & exam
    dmtGov: {
      'B': 2500,       // Car / Dual Purpose (Light Vehicle)
      'A': 2000,       // Motorcycle only
      'BA': 3200,      // Car + Motorcycle
      'HEAVY': 4500    // Heavy vehicle
    },
    // Driving School Packages (average estimates across Colombo & major districts)
    school: {
      'B_auto': 32000,
      'B_manual': 28000,
      'A': 12000,
      'BA_manual': 36000,
      'none': 0        // Self / private practice with own car
    },
    // Miscellaneous (passport photos, stamp duty, trial test vehicle rental on trial day)
    misc: 3000
  },

  init() {
    const classSelect = document.getElementById('calc-vehicle-class');
    const routeSelect = document.getElementById('calc-training-route');

    if (!classSelect || !routeSelect) return;

    const recalculate = () => {
      const vClass = classSelect.value;
      const route = routeSelect.value;

      const medicalCost = this.fees.medical;
      const govCost = this.fees.dmtGov[vClass] || 2500;
      let schoolCost = 0;

      if (route === 'school') {
        if (vClass === 'B') schoolCost = 30000;
        else if (vClass === 'A') schoolCost = 14000;
        else if (vClass === 'BA') schoolCost = 38000;
        else schoolCost = 45000;
      } else {
        // Self practice still incurs trial day vehicle booking fee
        schoolCost = 3500;
      }

      const total = medicalCost + govCost + schoolCost + this.fees.misc;

      const medEl = document.getElementById('calc-val-medical');
      const govEl = document.getElementById('calc-val-gov');
      const trnEl = document.getElementById('calc-val-training');
      const miscEl = document.getElementById('calc-val-misc');
      const totEl = document.getElementById('calc-val-total');

      if (medEl) medEl.textContent = `Rs. ${medicalCost.toLocaleString()}`;
      if (govEl) govEl.textContent = `Rs. ${govCost.toLocaleString()}`;
      if (trnEl) trnEl.textContent = `Rs. ${schoolCost.toLocaleString()}`;
      if (miscEl) miscEl.textContent = `Rs. ${this.fees.misc.toLocaleString()}`;
      if (totEl) totEl.textContent = `Rs. ${total.toLocaleString()}`;
    };

    classSelect.addEventListener('change', recalculate);
    routeSelect.addEventListener('change', recalculate);
    recalculate();
  }
};

// Interactive Timeline Simulator
const TimelineSimulator = {
  init() {
    const medDateInput = document.getElementById('timeline-medical-date');
    if (!medDateInput) return;

    // Default to today
    const today = new Date().toISOString().split('T')[0];
    medDateInput.value = today;

    const updateTimeline = () => {
      const selected = new Date(medDateInput.value);
      if (isNaN(selected.getTime())) return;

      // Registration & Theory: ~3 days after medical
      const regDate = new Date(selected);
      regDate.setDate(regDate.getDate() + 3);

      // Earliest Practical Trial: strictly 90 days (3 months) after Learner Permit
      const trialDate = new Date(regDate);
      trialDate.setDate(trialDate.getDate() + 90);

      // Temporary Driving Permit: Day of passing trial
      const tempLicenseDate = new Date(trialDate);

      // Smart Card Delivery: ~30-45 days after trial pass
      const cardDate = new Date(trialDate);
      cardDate.setDate(cardDate.getDate() + 35);

      const format = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const elReg = document.getElementById('tl-date-reg');
      const elTrial = document.getElementById('tl-date-trial');
      const elCard = document.getElementById('tl-date-card');

      if (elReg) elReg.textContent = format(regDate);
      if (elTrial) elTrial.textContent = format(trialDate);
      if (elCard) elCard.textContent = format(cardDate);
    };

    medDateInput.addEventListener('change', updateTimeline);
    updateTimeline();
  }
};

// Interactive Document Checklist
const ChecklistManager = {
  storageKey: 'sldl_checklist_v1',

  init() {
    const container = document.getElementById('doc-checklist');
    if (!container) return;

    const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(cb => {
      const id = cb.id;
      if (saved[id]) {
        cb.checked = true;
        cb.closest('.check-item')?.classList.add('checked');
      }

      cb.addEventListener('change', () => {
        saved[id] = cb.checked;
        localStorage.setItem(this.storageKey, JSON.stringify(saved));
        if (cb.checked) {
          cb.closest('.check-item')?.classList.add('checked');
          AudioEngine.playSuccess();
        } else {
          cb.closest('.check-item')?.classList.remove('checked');
          AudioEngine.playClick();
        }
        this.updateProgress();
      });
    });

    this.updateProgress();

    const resetBtn = document.getElementById('checklist-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem(this.storageKey);
        checkboxes.forEach(cb => {
          cb.checked = false;
          cb.closest('.check-item')?.classList.remove('checked');
        });
        this.updateProgress();
        AudioEngine.playClick();
      });
    }
  },

  updateProgress() {
    const container = document.getElementById('doc-checklist');
    if (!container) return;
    const all = container.querySelectorAll('input[type="checkbox"]');
    const checked = container.querySelectorAll('input[type="checkbox"]:checked');
    const counter = document.getElementById('checklist-counter');
    if (counter) {
      counter.textContent = `${checked.length} of ${all.length} Ready`;
    }
  }
};

// Mobile Nav Toggle
const NavManager = {
  init() {
    const btn = document.getElementById('mobile-menu-toggle');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
      AudioEngine.playClick();
    });
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  FeeCalculator.init();
  TimelineSimulator.init();
  ChecklistManager.init();
  NavManager.init();
});
