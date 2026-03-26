/**
 * DOCTORE.AR - Medical Trust Design
 * Main JavaScript File
 *
 * Features:
 * - i18n (internationalization) support
 * - Navigation scroll effects
 * - Mobile menu toggle
 * - Intersection Observer animations
 * - Smooth scrolling
 */

(function() {
  'use strict';

  // ===========================================
  // CONFIGURATION
  // ===========================================

  const CONFIG = {
    defaultLang: 'es',
    supportedLangs: ['es', 'en'],
    storageKey: 'doctore_lang',
    animationThreshold: 0.1,
    navScrollThreshold: 50
  };

  // ===========================================
  // STATE
  // ===========================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMobileMenuOpen: false
  };

  // ===========================================
  // DOM ELEMENTS
  // ===========================================

  const DOM = {
    nav: null,
    mobileToggle: null,
    mobileMenu: null,
    langButtons: null,
    translatableElements: null
  };

  // ===========================================
  // INITIALIZATION
  // ===========================================

  function init() {
    cacheDOMElements();
    loadSavedLanguage();
    loadTranslations(state.currentLang);
    setupEventListeners();
    setupIntersectionObserver();
    setupSmoothScroll();
  }

  function cacheDOMElements() {
    DOM.nav = document.querySelector('.nav');
    DOM.mobileToggle = document.querySelector('.nav__mobile-toggle');
    DOM.mobileMenu = document.querySelector('.nav__mobile-menu');
    DOM.langButtons = document.querySelectorAll('.nav__lang-btn');
    DOM.translatableElements = document.querySelectorAll('[data-i18n]');
  }

  // ===========================================
  // INTERNATIONALIZATION (i18n)
  // ===========================================

  function loadSavedLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    if (savedLang && CONFIG.supportedLangs.includes(savedLang)) {
      state.currentLang = savedLang;
    }
  }

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      state.translations = await response.json();
      applyTranslations();
      updateLangButtons();
      updateDocumentLang();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to default language if current fails
      if (lang !== CONFIG.defaultLang) {
        loadTranslations(CONFIG.defaultLang);
      }
    }
  }

  function applyTranslations() {
    DOM.translatableElements = document.querySelectorAll('[data-i18n]');

    DOM.translatableElements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = getNestedTranslation(key);

      if (translation) {
        // Check if it's a placeholder attribute
        if (element.hasAttribute('data-i18n-placeholder')) {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
  }

  function getNestedTranslation(key) {
    const keys = key.split('.');
    let value = state.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  function switchLanguage(lang) {
    if (lang === state.currentLang) return;
    if (!CONFIG.supportedLangs.includes(lang)) return;

    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);
    loadTranslations(lang);
  }

  function updateLangButtons() {
    DOM.langButtons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('nav__lang-btn--active', btnLang === state.currentLang);
    });
  }

  function updateDocumentLang() {
    document.documentElement.lang = state.currentLang;
  }

  // ===========================================
  // NAVIGATION
  // ===========================================

  function handleNavScroll() {
    const scrollY = window.scrollY;

    if (DOM.nav) {
      DOM.nav.classList.toggle('nav--scrolled', scrollY > CONFIG.navScrollThreshold);
    }
  }

  function toggleMobileMenu() {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;

    if (DOM.mobileToggle) {
      DOM.mobileToggle.classList.toggle('nav__mobile-toggle--active', state.isMobileMenuOpen);
    }

    if (DOM.mobileMenu) {
      DOM.mobileMenu.classList.toggle('nav__mobile-menu--active', state.isMobileMenuOpen);
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = state.isMobileMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (state.isMobileMenuOpen) {
      toggleMobileMenu();
    }
  }

  // ===========================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ===========================================

  function setupIntersectionObserver() {
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      revealElements.forEach(el => el.classList.add('reveal--visible'));
    }
  }

  // ===========================================
  // SMOOTH SCROLL
  // ===========================================

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const navHeight = DOM.nav ? DOM.nav.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          closeMobileMenu();
        }
      });
    });
  }

  // ===========================================
  // EVENT LISTENERS
  // ===========================================

  function setupEventListeners() {
    // Scroll event for navigation
    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Initial check for nav scroll state
    handleNavScroll();

    // Mobile menu toggle
    if (DOM.mobileToggle) {
      DOM.mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Language switcher
    DOM.langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        switchLanguage(lang);
      });
    });

    // Close mobile menu when clicking a link
    if (DOM.mobileMenu) {
      DOM.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (state.isMobileMenuOpen &&
          !DOM.mobileMenu.contains(e.target) &&
          !DOM.mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 1024 && state.isMobileMenuOpen) {
          closeMobileMenu();
        }
      }, 100);
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact__form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }
  }

  // ===========================================
  // FORM HANDLING
  // ===========================================

  function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Here you would typically send the data to a server
    console.log('Form submitted:', data);

    // Show success message (you can customize this)
    const submitBtn = form.querySelector('.form__submit');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = state.currentLang === 'es' ? 'Mensaje enviado!' : 'Message sent!';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 3000);
  }

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

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

  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ===========================================
  // START APPLICATION
  // ===========================================

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
