/**
 * Design 11: Timeline
 * Main JavaScript for doctore.ar Landing Page
 */

(function () {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore_lang',
    animationThreshold: 0.15,
    timelineThreshold: 0.3,
    scrollOffset: 70
  };

  // ==========================================================================
  // State
  // ==========================================================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    mobileMenuOpen: false,
    observers: []
  };

  // ==========================================================================
  // DOM Elements Cache
  // ==========================================================================

  const DOM = {
    get nav() { return document.querySelector('.nav'); },
    get mobileToggle() { return document.querySelector('.nav__mobile-toggle'); },
    get mobileMenu() { return document.querySelector('.nav__mobile-menu'); },
    get langButtons() { return document.querySelectorAll('.nav__lang-btn'); },
    get timelineItems() { return document.querySelectorAll('.timeline__item'); },
    get timelineLineProgress() { return document.querySelector('.timeline__line-progress'); },
    get pricingLineProgress() { return document.querySelector('.pricing__line-progress'); },
    get animateOnScroll() { return document.querySelectorAll('.animate-on-scroll'); },
    get heroTimelineNodes() { return document.querySelectorAll('.hero__timeline-node'); },
    get navLinks() { return document.querySelectorAll('.nav__link, .nav__mobile-link'); },
    get contactForm() { return document.querySelector('.contact__form'); }
  };

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Debounce function execution
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get nested object property by path
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Load JSON file
   */
  async function loadJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading JSON from ${url}:`, error);
      return null;
    }
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Initialize navigation functionality
   */
  function initNavigation() {
    // Scroll handler for nav styling
    const handleScroll = debounce(() => {
      const scrolled = window.scrollY > 50;
      DOM.nav?.classList.toggle('nav--scrolled', scrolled);
    }, 10);

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Mobile menu toggle
    DOM.mobileToggle?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on link click
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (state.mobileMenuOpen) {
          toggleMobileMenu();
        }
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
    });
  }

  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    DOM.mobileToggle?.classList.toggle('nav__mobile-toggle--open', state.mobileMenuOpen);
    DOM.mobileMenu?.classList.toggle('nav__mobile-menu--open', state.mobileMenuOpen);
    document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
  }

  /**
   * Handle smooth scroll
   */
  function handleSmoothScroll(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.offsetTop - CONFIG.scrollOffset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  }

  // ==========================================================================
  // Language System
  // ==========================================================================

  /**
   * Initialize language system
   */
  async function initLanguage() {
    // Load saved language preference
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    state.currentLang = savedLang || CONFIG.defaultLang;

    // Load translations
    await loadTranslations();

    // Setup language switcher
    DOM.langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang && lang !== state.currentLang) {
          setLanguage(lang);
        }
      });
    });

    // Apply initial language
    applyTranslations();
    updateLangButtons();
  }

  /**
   * Load translations for current language
   */
  async function loadTranslations() {
    const translations = await loadJSON(`lang/${state.currentLang}.json`);
    if (translations) {
      state.translations = translations;
    }
  }

  /**
   * Set language
   */
  async function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);
    await loadTranslations();
    applyTranslations();
    updateLangButtons();
  }

  /**
   * Update language buttons state
   */
  function updateLangButtons() {
    DOM.langButtons.forEach(btn => {
      const isActive = btn.dataset.lang === state.currentLang;
      btn.classList.toggle('nav__lang-btn--active', isActive);
    });
  }

  /**
   * Apply translations to DOM
   */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      const translation = getNestedValue(state.translations, key);
      if (translation) {
        element.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      const translation = getNestedValue(state.translations, key);
      if (translation) {
        element.placeholder = translation;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.dataset.i18nHtml;
      const translation = getNestedValue(state.translations, key);
      if (translation) {
        element.innerHTML = translation;
      }
    });
  }

  // ==========================================================================
  // Timeline Animations
  // ==========================================================================

  /**
   * Initialize timeline animations
   */
  function initTimelineAnimations() {
    // Observe timeline items
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('timeline__item--visible');
            entry.target.classList.add('timeline__item--active');
            updateTimelineProgress();
          }
        });
      },
      {
        threshold: CONFIG.timelineThreshold,
        rootMargin: '-50px 0px'
      }
    );

    DOM.timelineItems.forEach(item => {
      timelineObserver.observe(item);
    });

    state.observers.push(timelineObserver);

    // Initialize hero timeline animation
    initHeroTimelineAnimation();
  }

  /**
   * Update timeline progress bar
   */
  function updateTimelineProgress() {
    const items = DOM.timelineItems;
    if (!items.length || !DOM.timelineLineProgress) return;

    const visibleItems = document.querySelectorAll('.timeline__item--visible');
    const progress = (visibleItems.length / items.length) * 100;
    DOM.timelineLineProgress.style.height = `${progress}%`;
  }

  /**
   * Initialize hero timeline animation
   */
  function initHeroTimelineAnimation() {
    let currentNode = 0;
    const nodes = DOM.heroTimelineNodes;
    if (!nodes.length) return;

    const animateNodes = () => {
      nodes.forEach((node, index) => {
        node.classList.toggle('hero__timeline-node--active', index === currentNode);
      });
      currentNode = (currentNode + 1) % nodes.length;
    };

    // Initial activation
    animateNodes();

    // Cycle through nodes
    setInterval(animateNodes, 2000);
  }

  // ==========================================================================
  // Scroll Animations
  // ==========================================================================

  /**
   * Initialize scroll animations
   */
  function initScrollAnimations() {
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll--visible');
          }
        });
      },
      {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    DOM.animateOnScroll.forEach(element => {
      scrollObserver.observe(element);
    });

    state.observers.push(scrollObserver);

    // Pricing line animation
    initPricingLineAnimation();
  }

  /**
   * Initialize pricing line animation
   */
  function initPricingLineAnimation() {
    const pricingSection = document.querySelector('.pricing');
    if (!pricingSection || !DOM.pricingLineProgress) return;

    const pricingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            DOM.pricingLineProgress.style.width = '100%';
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    pricingObserver.observe(pricingSection);
    state.observers.push(pricingObserver);
  }

  // ==========================================================================
  // Form Handling
  // ==========================================================================

  /**
   * Initialize contact form
   */
  function initContactForm() {
    const form = DOM.contactForm;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      if (!data.name || !data.email || !data.message) {
        showFormMessage(form, 'error', 'Por favor completa todos los campos requeridos.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        showFormMessage(form, 'error', 'Por favor ingresa un email valido.');
        return;
      }

      // Simulate form submission
      const submitBtn = form.querySelector('.contact__form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        showFormMessage(form, 'success', 'Mensaje enviado correctamente. Te contactaremos pronto.');
        form.reset();
      } catch (error) {
        showFormMessage(form, 'error', 'Error al enviar el mensaje. Por favor intenta nuevamente.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  /**
   * Show form message
   */
  function showFormMessage(form, type, message) {
    // Remove existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message--${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      background-color: ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
      color: white;
    `;

    form.insertBefore(messageEl, form.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }

  // ==========================================================================
  // Active Section Tracking
  // ==========================================================================

  /**
   * Initialize active section tracking
   */
  function initActiveSectionTracking() {
    const sections = document.querySelectorAll('section[id]');

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            updateActiveNavLink(id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: `-${CONFIG.scrollOffset}px 0px -50% 0px`
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });

    state.observers.push(sectionObserver);
  }

  /**
   * Update active navigation link
   */
  function updateActiveNavLink(sectionId) {
    DOM.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === `#${sectionId}`;
      link.classList.toggle('nav__link--active', isActive);
    });
  }

  // ==========================================================================
  // Calendar Mock Data
  // ==========================================================================

  /**
   * Initialize calendar mock in product section
   */
  function initCalendarMock() {
    const calendarGrid = document.querySelector('.product__mockup-calendar-grid');
    if (!calendarGrid) return;

    // Generate calendar days
    const daysInMonth = 31;
    const startDay = 5; // Friday (0 = Sunday)
    const today = 15;
    const eventDays = [8, 12, 18, 22, 25];

    // Day headers
    const dayHeaders = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    dayHeaders.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.className = 'product__mockup-calendar-day';
      dayEl.textContent = day;
      dayEl.style.fontWeight = '600';
      dayEl.style.color = 'var(--color-neutral-500)';
      calendarGrid.appendChild(dayEl);
    });

    // Empty days before month starts
    for (let i = 0; i < startDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'product__mockup-calendar-day';
      calendarGrid.appendChild(emptyDay);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'product__mockup-calendar-day';
      dayEl.textContent = day;

      if (day === today) {
        dayEl.classList.add('product__mockup-calendar-day--active');
      } else if (eventDays.includes(day)) {
        dayEl.classList.add('product__mockup-calendar-day--has-event');
      }

      calendarGrid.appendChild(dayEl);
    }
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize all components
   */
  async function init() {
    try {
      // Initialize core functionality
      await initLanguage();
      initNavigation();
      initTimelineAnimations();
      initScrollAnimations();
      initContactForm();
      initActiveSectionTracking();
      initCalendarMock();

      // Remove loading state if any
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');

    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Cleanup observers and event listeners
   */
  function cleanup() {
    state.observers.forEach(observer => observer.disconnect());
    state.observers = [];
  }

  // Handle page unload
  window.addEventListener('beforeunload', cleanup);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
