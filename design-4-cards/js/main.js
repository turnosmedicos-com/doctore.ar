/**
 * doctore.ar - Card Grid Design
 * Main JavaScript for i18n and interactivity
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
    langPath: 'lang/'
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let currentLang = CONFIG.defaultLang;
  let translations = {};

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const elements = {
    langSwitch: null,
    langSwitchMobile: null,
    mobileToggle: null,
    mobileMenu: null,
    nav: null
  };

  // ==========================================================================
  // i18n Functions
  // ==========================================================================

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - The object to traverse
   * @param {string} path - Dot notation path (e.g., 'nav.services')
   * @returns {string} The value or the path if not found
   */
  function getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path; // Return path if not found
      }
    }

    return value;
  }

  /**
   * Load translations from JSON file
   * @param {string} lang - Language code
   * @returns {Promise<Object>} Translations object
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`${CONFIG.langPath}${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Translation loading error:', error);
      return {};
    }
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = getNestedValue(translations, key);

      if (translation && typeof translation === 'string') {
        // Check for placeholder attribute
        if (element.hasAttribute('placeholder')) {
          element.setAttribute('placeholder', translation);
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;

    // Update language switcher text
    updateLangSwitchText();
  }

  /**
   * Update language switcher button text
   */
  function updateLangSwitchText() {
    const langText = currentLang.toUpperCase();

    if (elements.langSwitch) {
      const textSpan = elements.langSwitch.querySelector('span');
      if (textSpan) {
        textSpan.textContent = langText;
      }
    }

    if (elements.langSwitchMobile) {
      const textSpan = elements.langSwitchMobile.querySelector('span');
      if (textSpan) {
        textSpan.textContent = langText;
      }
    }
  }

  /**
   * Switch language
   * @param {string} lang - Language code to switch to
   */
  async function switchLanguage(lang) {
    if (!CONFIG.supportedLangs.includes(lang)) {
      console.warn(`Language ${lang} is not supported`);
      return;
    }

    if (lang === currentLang && Object.keys(translations).length > 0) {
      return; // Already loaded
    }

    currentLang = lang;
    translations = await loadTranslations(lang);
    applyTranslations();

    // Save preference
    try {
      localStorage.setItem(CONFIG.storageKey, lang);
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  }

  /**
   * Toggle between available languages
   */
  function toggleLanguage() {
    const currentIndex = CONFIG.supportedLangs.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % CONFIG.supportedLangs.length;
    const nextLang = CONFIG.supportedLangs[nextIndex];
    switchLanguage(nextLang);
  }

  /**
   * Get saved language preference
   * @returns {string} Language code
   */
  function getSavedLanguage() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved && CONFIG.supportedLangs.includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language preference:', e);
    }
    return CONFIG.defaultLang;
  }

  // ==========================================================================
  // Navigation Functions
  // ==========================================================================

  /**
   * Initialize navigation scroll behavior
   */
  function initNavScroll() {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (elements.nav) {
        if (currentScroll > 10) {
          elements.nav.classList.add('nav--scrolled');
        } else {
          elements.nav.classList.remove('nav--scrolled');
        }
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  /**
   * Initialize mobile menu toggle
   */
  function initMobileMenu() {
    if (!elements.mobileToggle || !elements.mobileMenu) return;

    elements.mobileToggle.addEventListener('click', () => {
      const isOpen = elements.mobileMenu.classList.contains('is-open');

      if (isOpen) {
        elements.mobileMenu.classList.remove('is-open');
        elements.mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
        elements.mobileMenu.classList.add('is-open');
        elements.mobileToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu on link click
    const mobileLinks = elements.mobileMenu.querySelectorAll('.nav__mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('is-open');
        elements.mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!elements.mobileMenu.contains(e.target) &&
          !elements.mobileToggle.contains(e.target) &&
          elements.mobileMenu.classList.contains('is-open')) {
        elements.mobileMenu.classList.remove('is-open');
        elements.mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Initialize smooth scroll for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const navHeight = elements.nav ? elements.nav.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ==========================================================================
  // Form Handling
  // ==========================================================================

  /**
   * Initialize contact form
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Simple validation
      if (!data.name || !data.email || !data.message) {
        alert(currentLang === 'es'
          ? 'Por favor completa todos los campos.'
          : 'Please fill in all fields.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        alert(currentLang === 'es'
          ? 'Por favor ingresa un email valido.'
          : 'Please enter a valid email.');
        return;
      }

      // Simulate form submission
      console.log('Form submitted:', data);

      alert(currentLang === 'es'
        ? 'Gracias por tu mensaje. Te contactaremos pronto.'
        : 'Thank you for your message. We will contact you soon.');

      form.reset();
    });
  }

  // ==========================================================================
  // Intersection Observer for Animations
  // ==========================================================================

  /**
   * Initialize fade-in animations on scroll
   */
  function initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe cards for animation
    document.querySelectorAll('.card').forEach(card => {
      observer.observe(card);
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.langSwitch = document.getElementById('lang-switch');
    elements.langSwitchMobile = document.getElementById('lang-switch-mobile');
    elements.mobileToggle = document.getElementById('mobile-toggle');
    elements.mobileMenu = document.getElementById('mobile-menu');
    elements.nav = document.querySelector('.nav');
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Language switcher
    if (elements.langSwitch) {
      elements.langSwitch.addEventListener('click', toggleLanguage);
    }

    if (elements.langSwitchMobile) {
      elements.langSwitchMobile.addEventListener('click', toggleLanguage);
    }
  }

  /**
   * Initialize the application
   */
  async function init() {
    // Cache DOM elements
    cacheElements();

    // Load saved language or default
    const savedLang = getSavedLanguage();
    await switchLanguage(savedLang);

    // Bind events
    bindEvents();

    // Initialize features
    initNavScroll();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    initScrollAnimations();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
