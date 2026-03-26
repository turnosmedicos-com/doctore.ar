/**
 * Design 17 - Parallax: Main JavaScript
 * Layered depth, parallax scroll effects, immersive experience
 */

(function () {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    defaultLang: 'es',
    supportedLangs: ['es', 'en'],
    storageKey: 'doctore_lang',
    navScrollThreshold: 50,
    revealThreshold: 0.15,
    parallaxSpeed: 0.5
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
    html: document.documentElement,
    nav: document.querySelector('.nav'),
    navToggle: document.querySelector('.nav__toggle'),
    navMobile: document.querySelector('.nav__mobile'),
    langToggle: document.querySelector('.nav__lang'),
    langText: document.querySelector('.nav__lang-text'),
    parallaxLayers: document.querySelectorAll('.parallax-layer__shape'),
    revealElements: document.querySelectorAll('.reveal')
  };

  // ==========================================================================
  // Language System
  // ==========================================================================

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
      return await response.json();
    } catch (error) {
      console.error('Translation loading error:', error);
      return null;
    }
  }

  function applyTranslations(translations) {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const keys = key.split('.');
      let value = translations;

      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          value = null;
          break;
        }
      }

      if (value && typeof value === 'string') {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = value;
        } else {
          element.textContent = value;
        }
      }
    });

    // Update HTML lang attribute
    elements.html.setAttribute('lang', state.currentLang);
  }

  async function setLanguage(lang) {
    if (!CONFIG.supportedLangs.includes(lang)) {
      lang = CONFIG.defaultLang;
    }

    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);

    if (!state.translations[lang]) {
      state.translations[lang] = await loadTranslations(lang);
    }

    applyTranslations(state.translations[lang]);
    updateLangToggle();
  }

  function updateLangToggle() {
    if (elements.langText) {
      elements.langText.textContent = state.currentLang.toUpperCase();
    }
  }

  function toggleLanguage() {
    const newLang = state.currentLang === 'es' ? 'en' : 'es';
    setLanguage(newLang);
  }

  function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang || (CONFIG.supportedLangs.includes(browserLang) ? browserLang : CONFIG.defaultLang);
    setLanguage(initialLang);
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  function handleScroll() {
    const scrollY = window.scrollY;

    // Nav background on scroll
    if (scrollY > CONFIG.navScrollThreshold && !state.isScrolled) {
      state.isScrolled = true;
      elements.nav.classList.add('nav--scrolled');
    } else if (scrollY <= CONFIG.navScrollThreshold && state.isScrolled) {
      state.isScrolled = false;
      elements.nav.classList.remove('nav--scrolled');
    }

    // Parallax effect for background shapes
    updateParallaxLayers(scrollY);
  }

  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.navToggle.classList.toggle('nav__toggle--active', state.isMenuOpen);
    elements.navMobile.classList.toggle('nav__mobile--open', state.isMenuOpen);
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (state.isMenuOpen) {
      state.isMenuOpen = false;
      elements.navToggle.classList.remove('nav__toggle--active');
      elements.navMobile.classList.remove('nav__mobile--open');
      document.body.style.overflow = '';
    }
  }

  function initNavigation() {
    // Mobile menu toggle
    if (elements.navToggle) {
      elements.navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close menu on link click
    document.querySelectorAll('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Language toggle
    if (elements.langToggle) {
      elements.langToggle.addEventListener('click', toggleLanguage);
    }

    // Scroll handling with throttle
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = elements.nav.offsetHeight;
          const targetPosition = target.offsetTop - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          closeMobileMenu();
        }
      });
    });
  }

  // ==========================================================================
  // Parallax Effects
  // ==========================================================================

  function updateParallaxLayers(scrollY) {
    if (!elements.parallaxLayers.length) return;

    elements.parallaxLayers.forEach((layer, index) => {
      const speed = (index + 1) * 0.1;
      const yOffset = scrollY * speed;
      layer.style.transform = `translateY(${yOffset}px)`;
    });
  }

  // ==========================================================================
  // Scroll Reveal Animations
  // ==========================================================================

  function initRevealAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: CONFIG.revealThreshold
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elements.revealElements.forEach(el => observer.observe(el));
  }

  // ==========================================================================
  // Form Handling
  // ==========================================================================

  function initContactForm() {
    const form = document.querySelector('.contact__form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Here you would typically send the data to your backend
      console.log('Form submitted:', data);

      // Show success feedback
      const submitBtn = form.querySelector('.contact__form-submit .btn');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  // ==========================================================================
  // Preloader / Initial Animations
  // ==========================================================================

  function initPageLoad() {
    // Remove any preloader class after content loads
    document.body.classList.add('loaded');

    // Trigger initial reveals for above-fold content
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal').forEach(el => {
        el.classList.add('reveal--visible');
      });
    }, 100);
  }

  // ==========================================================================
  // Keyboard Navigation
  // ==========================================================================

  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Close mobile menu with Escape
      if (e.key === 'Escape' && state.isMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  function init() {
    initLanguage();
    initNavigation();
    initRevealAnimations();
    initContactForm();
    initKeyboardNav();
    initPageLoad();

    // Initial scroll check
    handleScroll();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
