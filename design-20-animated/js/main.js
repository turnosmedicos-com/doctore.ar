/**
 * doctore.ar - Animated/Micro-interactions Design
 * Main JavaScript file
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    scrollOffset: 50,
    animationThreshold: 0.1,
    typingSpeed: 100,
    counterDuration: 2000,
    defaultLang: 'es',
    storageKey: 'doctore_lang',
  };

  // ============================================
  // STATE
  // ============================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false,
    isAnnualPricing: false,
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const DOM = {
    // Navigation
    nav: document.querySelector('.nav'),
    navMobileToggle: document.querySelector('.nav__mobile-toggle'),
    navMobileMenu: document.querySelector('.nav__mobile-menu'),
    navLinks: document.querySelectorAll('.nav__link'),

    // Language
    langToggle: document.querySelector('.nav__lang-toggle'),
    langText: document.querySelector('.nav__lang-text'),

    // Scroll elements
    scrollTop: document.querySelector('.scroll-top'),

    // Animated elements
    animatedElements: document.querySelectorAll('.animate-on-scroll'),

    // Pricing toggle
    pricingToggle: document.querySelector('.pricing__toggle-switch'),
    pricingLabels: document.querySelectorAll('.pricing__toggle-label'),

    // Page loader
    pageLoader: document.querySelector('.page-loader'),

    // Counter elements
    counters: document.querySelectorAll('[data-counter]'),

    // Translatable elements
    translatables: document.querySelectorAll('[data-i18n]'),
    translatablePlaceholders: document.querySelectorAll('[data-i18n-placeholder]'),
  };

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Debounce function
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
   * Throttle function
   */
  function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Check if reduced motion is preferred
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Animate counter
   */
  function animateCounter(element, target, duration) {
    if (prefersReducedMotion()) {
      element.textContent = target;
      return;
    }

    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOutQuart);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // ============================================
  // LANGUAGE SYSTEM
  // ============================================

  /**
   * Load translations
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load translations');
      state.translations = await response.json();
      applyTranslations();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  /**
   * Apply translations to DOM
   */
  function applyTranslations() {
    DOM.translatables.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const translation = getNestedTranslation(key);
      if (translation) {
        element.textContent = translation;
      }
    });

    DOM.translatablePlaceholders.forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = getNestedTranslation(key);
      if (translation) {
        element.placeholder = translation;
      }
    });

    // Update document language
    document.documentElement.lang = state.currentLang;
  }

  /**
   * Get nested translation value
   */
  function getNestedTranslation(key) {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), state.translations);
  }

  /**
   * Toggle language
   */
  function toggleLanguage() {
    state.currentLang = state.currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem(CONFIG.storageKey, state.currentLang);

    if (DOM.langText) {
      DOM.langText.textContent = state.currentLang.toUpperCase();
    }

    loadTranslations(state.currentLang);
  }

  /**
   * Initialize language
   */
  function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    if (savedLang && ['es', 'en'].includes(savedLang)) {
      state.currentLang = savedLang;
    }

    if (DOM.langText) {
      DOM.langText.textContent = state.currentLang.toUpperCase();
    }

    loadTranslations(state.currentLang);
  }

  // ============================================
  // NAVIGATION
  // ============================================

  /**
   * Handle scroll for navigation
   */
  function handleNavScroll() {
    const scrolled = window.scrollY > CONFIG.scrollOffset;
    DOM.nav?.classList.toggle('scrolled', scrolled);
  }

  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    DOM.navMobileToggle?.classList.toggle('active', state.isMenuOpen);
    DOM.navMobileMenu?.classList.toggle('active', state.isMenuOpen);
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    state.isMenuOpen = false;
    DOM.navMobileToggle?.classList.remove('active');
    DOM.navMobileMenu?.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Smooth scroll to section
   */
  function scrollToSection(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = DOM.nav?.offsetHeight || 0;
        const targetPosition = target.offsetTop - navHeight;

        if (prefersReducedMotion()) {
          window.scrollTo(0, targetPosition);
        } else {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }

        closeMobileMenu();
      }
    }
  }

  // ============================================
  // SCROLL TO TOP
  // ============================================

  /**
   * Handle scroll to top visibility
   */
  function handleScrollTopVisibility() {
    const visible = window.scrollY > 500;
    DOM.scrollTop?.classList.toggle('visible', visible);
  }

  /**
   * Scroll to top
   */
  function scrollToTop() {
    if (prefersReducedMotion()) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================

  /**
   * Initialize Intersection Observer for scroll animations
   */
  function initScrollAnimations() {
    if (prefersReducedMotion()) {
      DOM.animatedElements.forEach((el) => el.classList.add('animate-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    DOM.animatedElements.forEach((el) => observer.observe(el));
  }

  /**
   * Initialize counter animations
   */
  function initCounterAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-counter'), 10);
            animateCounter(entry.target, target, CONFIG.counterDuration);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    DOM.counters.forEach((counter) => observer.observe(counter));
  }

  // ============================================
  // PRICING TOGGLE
  // ============================================

  /**
   * Toggle pricing period
   */
  function togglePricing() {
    state.isAnnualPricing = !state.isAnnualPricing;
    DOM.pricingToggle?.classList.toggle('active', state.isAnnualPricing);

    DOM.pricingLabels.forEach((label, index) => {
      label.classList.toggle('active', state.isAnnualPricing ? index === 1 : index === 0);
    });

    // Update prices
    const monthlyPrices = document.querySelectorAll('[data-price-monthly]');
    const annualPrices = document.querySelectorAll('[data-price-annual]');

    monthlyPrices.forEach((el) => {
      el.style.display = state.isAnnualPricing ? 'none' : 'flex';
    });

    annualPrices.forEach((el) => {
      el.style.display = state.isAnnualPricing ? 'flex' : 'none';
    });
  }

  // ============================================
  // PAGE LOADER
  // ============================================

  /**
   * Hide page loader
   */
  function hidePageLoader() {
    if (DOM.pageLoader) {
      DOM.pageLoader.classList.add('hidden');
      setTimeout(() => {
        DOM.pageLoader.style.display = 'none';
      }, 500);
    }
  }

  // ============================================
  // BUTTON RIPPLE EFFECT
  // ============================================

  /**
   * Create ripple effect on buttons
   */
  function createRipple(e) {
    if (prefersReducedMotion()) return;

    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }

  // ============================================
  // FORM HANDLING
  // ============================================

  /**
   * Handle form submission
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('.contact__form-submit');
    const originalText = button.textContent;

    // Simulate form submission
    button.disabled = true;
    button.textContent = state.currentLang === 'es' ? 'Enviando...' : 'Sending...';

    setTimeout(() => {
      button.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
      button.classList.add('btn--secondary');
      button.classList.remove('btn--primary');

      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
        button.classList.add('btn--primary');
        button.classList.remove('btn--secondary');
        form.reset();
      }, 2000);
    }, 1500);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function bindEvents() {
    // Scroll events
    window.addEventListener('scroll', throttle(handleNavScroll, 100));
    window.addEventListener('scroll', throttle(handleScrollTopVisibility, 100));

    // Mobile menu
    DOM.navMobileToggle?.addEventListener('click', toggleMobileMenu);

    // Navigation links
    DOM.navLinks.forEach((link) => {
      link.addEventListener('click', scrollToSection);
    });

    // Mobile menu links
    document.querySelectorAll('.nav__mobile-menu .nav__link').forEach((link) => {
      link.addEventListener('click', scrollToSection);
    });

    // Language toggle
    DOM.langToggle?.addEventListener('click', toggleLanguage);

    // Scroll to top
    DOM.scrollTop?.addEventListener('click', scrollToTop);

    // Pricing toggle
    DOM.pricingToggle?.addEventListener('click', togglePricing);

    // Button ripple effects
    document.querySelectorAll('.btn').forEach((button) => {
      button.addEventListener('click', createRipple);
    });

    // Form submission
    const contactForm = document.querySelector('.contact__form');
    contactForm?.addEventListener('submit', handleFormSubmit);

    // Close mobile menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isMenuOpen) {
        closeMobileMenu();
      }
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (
        state.isMenuOpen &&
        !DOM.navMobileMenu?.contains(e.target) &&
        !DOM.navMobileToggle?.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Window resize
    window.addEventListener(
      'resize',
      debounce(() => {
        if (window.innerWidth >= 1024 && state.isMenuOpen) {
          closeMobileMenu();
        }
      }, 250)
    );
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Initialize language
    initLanguage();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize counter animations
    initCounterAnimations();

    // Bind events
    bindEvents();

    // Initial scroll state
    handleNavScroll();
    handleScrollTopVisibility();

    // Hide loader
    hidePageLoader();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to global scope for debugging
  window.doctore = {
    state,
    toggleLanguage,
    togglePricing,
  };
})();
