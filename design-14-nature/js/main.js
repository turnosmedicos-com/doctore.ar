/**
 * Design 14 - Nature/Organic Theme
 * Main JavaScript - Interactions and Language Switching
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore-lang',
    headerScrollThreshold: 50,
    animationObserverThreshold: 0.1,
    turnosMedicosUrl: 'https://login.turnosmedicos.com'
  };

  // ==========================================================================
  // STATE
  // ==========================================================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false,
    isAnnualPricing: true
  };

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================

  const elements = {
    html: document.documentElement,
    header: null,
    menuToggle: null,
    mobileNav: null,
    langButtons: null,
    pricingToggle: null,
    fadeElements: null
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async function init() {
    cacheElements();
    await loadTranslations();
    initLanguage();
    initHeader();
    initMobileMenu();
    initLanguageSwitcher();
    initPricingToggle();
    initScrollAnimations();
    initSmoothScroll();
  }

  function cacheElements() {
    elements.header = document.querySelector('.header');
    elements.menuToggle = document.querySelector('.menu-toggle');
    elements.mobileNav = document.querySelector('.mobile-nav');
    elements.langButtons = document.querySelectorAll('.lang-btn');
    elements.pricingToggle = document.querySelectorAll('.pricing-toggle-btn');
    elements.fadeElements = document.querySelectorAll('.fade-in');
  }

  // ==========================================================================
  // TRANSLATIONS
  // ==========================================================================

  async function loadTranslations() {
    try {
      const [esResponse, enResponse] = await Promise.all([
        fetch('./lang/es.json'),
        fetch('./lang/en.json')
      ]);

      state.translations.es = await esResponse.json();
      state.translations.en = await enResponse.json();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    const browserLang = navigator.language.split('-')[0];

    if (savedLang && state.translations[savedLang]) {
      state.currentLang = savedLang;
    } else if (state.translations[browserLang]) {
      state.currentLang = browserLang;
    } else {
      state.currentLang = CONFIG.defaultLang;
    }

    applyTranslations();
    updateLangButtons();
  }

  function setLanguage(lang) {
    if (state.translations[lang] && lang !== state.currentLang) {
      state.currentLang = lang;
      localStorage.setItem(CONFIG.storageKey, lang);
      applyTranslations();
      updateLangButtons();
      elements.html.setAttribute('lang', lang);
    }
  }

  function applyTranslations() {
    const translations = state.translations[state.currentLang];
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedTranslation(translations, key);

      if (value) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = value;
        } else {
          element.innerHTML = value;
        }
      }
    });

    // Update document title
    if (translations.meta && translations.meta.title) {
      document.title = translations.meta.title;
    }
  }

  function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  function updateLangButtons() {
    elements.langButtons.forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === state.currentLang);
    });
  }

  function initLanguageSwitcher() {
    elements.langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });
  }

  // ==========================================================================
  // HEADER
  // ==========================================================================

  function initHeader() {
    if (!elements.header) return;

    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > CONFIG.headerScrollThreshold;

      elements.header.classList.toggle('scrolled', isScrolled);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    updateHeader();
  }

  // ==========================================================================
  // MOBILE MENU
  // ==========================================================================

  function initMobileMenu() {
    if (!elements.menuToggle || !elements.mobileNav) return;

    elements.menuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking on links
    elements.mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isMenuOpen) {
        closeMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (state.isMenuOpen &&
          !elements.mobileNav.contains(e.target) &&
          !elements.menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  function toggleMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.menuToggle.classList.toggle('active', state.isMenuOpen);
    elements.mobileNav.classList.toggle('active', state.isMenuOpen);
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMenu() {
    state.isMenuOpen = false;
    elements.menuToggle.classList.remove('active');
    elements.mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // PRICING TOGGLE
  // ==========================================================================

  function initPricingToggle() {
    if (!elements.pricingToggle.length) return;

    elements.pricingToggle.forEach(btn => {
      btn.addEventListener('click', () => {
        const isAnnual = btn.getAttribute('data-period') === 'annual';
        state.isAnnualPricing = isAnnual;

        elements.pricingToggle.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-period') === (isAnnual ? 'annual' : 'monthly'));
        });

        updatePricing();
      });
    });
  }

  function updatePricing() {
    const priceElements = document.querySelectorAll('[data-price-monthly]');

    priceElements.forEach(el => {
      const monthly = el.getAttribute('data-price-monthly');
      const annual = el.getAttribute('data-price-annual');
      el.textContent = state.isAnnualPricing ? annual : monthly;
    });
  }

  // ==========================================================================
  // SCROLL ANIMATIONS
  // ==========================================================================

  function initScrollAnimations() {
    if (!elements.fadeElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.animationObserverThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    elements.fadeElements.forEach(el => {
      observer.observe(el);
    });
  }

  // ==========================================================================
  // SMOOTH SCROLL
  // ==========================================================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          const headerHeight = elements.header ? elements.header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          if (state.isMenuOpen) {
            closeMenu();
          }
        }
      });
    });
  }

  // ==========================================================================
  // FORM HANDLING
  // ==========================================================================

  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      if (!data.name || !data.email || !data.message) {
        alert(state.currentLang === 'es'
          ? 'Por favor complete todos los campos requeridos.'
          : 'Please fill in all required fields.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        alert(state.currentLang === 'es'
          ? 'Por favor ingrese un email valido.'
          : 'Please enter a valid email.');
        return;
      }

      // Here you would typically send the data to a server
      // For now, we'll just show a success message
      alert(state.currentLang === 'es'
        ? 'Gracias por su mensaje. Nos pondremos en contacto pronto.'
        : 'Thank you for your message. We will contact you soon.');

      form.reset();
    });
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

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
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ==========================================================================
  // START
  // ==========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
