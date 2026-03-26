/**
 * doctore.ar - Corporate Clean Landing Page
 * Main JavaScript Module
 */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    defaultLang: 'es',
    supportedLangs: ['es', 'en'],
    storageKey: 'doctore_lang',
    scrollThreshold: 50,
    animationThreshold: 0.1
  };

  // ==========================================================================
  // State
  // ==========================================================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false,
    isScrolled: false
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const elements = {
    nav: null,
    mobileToggle: null,
    mobileMenu: null,
    langButtons: null,
    i18nElements: null
  };

  // ==========================================================================
  // Internationalization (i18n)
  // ==========================================================================

  /**
   * Load translations from JSON file
   * @param {string} lang - Language code
   * @returns {Promise<Object>} Translations object
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      return null;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot-notation path
   * @returns {*} Value at path or undefined
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  function applyTranslations() {
    const translations = state.translations;
    if (!translations) return;

    document.body.classList.add('lang-switching');

    elements.i18nElements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const attr = element.getAttribute('data-i18n-attr');
      const value = getNestedValue(translations, key);

      if (value !== undefined) {
        if (attr) {
          element.setAttribute(attr, value);
        } else {
          element.textContent = value;
        }
      }
    });

    // Update page title
    const titleTranslation = getNestedValue(translations, 'meta.title');
    if (titleTranslation) {
      document.title = titleTranslation;
    }

    // Update meta description
    const descMeta = document.querySelector('meta[name="description"]');
    const descTranslation = getNestedValue(translations, 'meta.description');
    if (descMeta && descTranslation) {
      descMeta.setAttribute('content', descTranslation);
    }

    // Update HTML lang attribute
    document.documentElement.lang = state.currentLang;

    setTimeout(() => {
      document.body.classList.remove('lang-switching');
    }, 200);
  }

  /**
   * Set language and update UI
   * @param {string} lang - Language code
   */
  async function setLanguage(lang) {
    if (!CONFIG.supportedLangs.includes(lang)) {
      lang = CONFIG.defaultLang;
    }

    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);

    // Update language button states
    elements.langButtons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('nav__lang-btn--active', btnLang === lang);
    });

    // Load and apply translations
    state.translations = await loadTranslations(lang);
    if (state.translations) {
      applyTranslations();
    }
  }

  /**
   * Initialize language from localStorage or default
   */
  async function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    const browserLang = navigator.language.split('-')[0];

    let initialLang = CONFIG.defaultLang;

    if (savedLang && CONFIG.supportedLangs.includes(savedLang)) {
      initialLang = savedLang;
    } else if (CONFIG.supportedLangs.includes(browserLang)) {
      initialLang = browserLang;
    }

    await setLanguage(initialLang);
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Handle scroll events for navigation
   */
  function handleScroll() {
    const scrolled = window.scrollY > CONFIG.scrollThreshold;

    if (scrolled !== state.isScrolled) {
      state.isScrolled = scrolled;
      elements.nav.classList.toggle('nav--scrolled', scrolled);
    }
  }

  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;

    elements.mobileToggle.classList.toggle('nav__mobile-toggle--open', state.isMenuOpen);
    elements.mobileMenu.classList.toggle('nav__mobile-menu--open', state.isMenuOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    if (state.isMenuOpen) {
      state.isMenuOpen = false;
      elements.mobileToggle.classList.remove('nav__mobile-toggle--open');
      elements.mobileMenu.classList.remove('nav__mobile-menu--open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle smooth scroll to sections
   * @param {Event} e - Click event
   */
  function handleNavClick(e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      closeMobileMenu();

      const navHeight = elements.nav.offsetHeight;
      const targetPosition = target.offsetTop - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // ==========================================================================
  // Scroll Animations
  // ==========================================================================

  /**
   * Initialize Intersection Observer for scroll animations
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-children');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              entry.target.classList.contains('stagger-children')
                ? 'stagger-children--visible'
                : 'animate-on-scroll--visible'
            );
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    animatedElements.forEach(el => observer.observe(el));
  }

  // ==========================================================================
  // Form Handling
  // ==========================================================================

  /**
   * Handle contact form submission
   * @param {Event} e - Submit event
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // In a real implementation, this would send to a server
    console.log('Form submitted:', data);

    // Show success feedback (could be enhanced with a toast notification)
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 2000);
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.nav = document.querySelector('.nav');
    elements.mobileToggle = document.querySelector('.nav__mobile-toggle');
    elements.mobileMenu = document.querySelector('.nav__mobile-menu');
    elements.langButtons = document.querySelectorAll('.nav__lang-btn');
    elements.i18nElements = document.querySelectorAll('[data-i18n]');
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    // Scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile menu toggle
    if (elements.mobileToggle) {
      elements.mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Language switcher
    elements.langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });

    // Navigation links (smooth scroll)
    document.addEventListener('click', handleNavClick);

    // Close mobile menu on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    });

    // Contact form
    const contactForm = document.querySelector('.contact__form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (state.isMenuOpen &&
          !e.target.closest('.nav__mobile-menu') &&
          !e.target.closest('.nav__mobile-toggle')) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Initialize application
   */
  async function init() {
    cacheElements();
    attachEventListeners();
    await initLanguage();
    initScrollAnimations();

    // Check initial scroll position
    handleScroll();

    // Add loaded class for any initial animations
    document.body.classList.add('loaded');
  }

  // Start application when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
