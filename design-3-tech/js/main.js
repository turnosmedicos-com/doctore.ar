/**
 * doctore.ar - Tech Forward Design
 * Main JavaScript Module
 * Handles i18n, navigation, animations, and interactions
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    defaultLang: 'es',
    supportedLangs: ['es', 'en'],
    storageKey: 'doctore_lang',
    animationThreshold: 0.1,
    scrollOffset: 100
  };

  // ============================================
  // State
  // ============================================
  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false,
    isScrolled: false
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    navbar: null,
    mobileMenuBtn: null,
    mobileMenu: null,
    langButtons: null,
    revealElements: null
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    cacheElements();
    initLanguage();
    initNavigation();
    initScrollEffects();
    initAnimations();
    initMockUI();
    initPricingToggle();
    initContactForm();
  }

  function cacheElements() {
    elements.navbar = document.querySelector('.navbar');
    elements.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    elements.mobileMenu = document.querySelector('.mobile-menu');
    elements.langButtons = document.querySelectorAll('.lang-btn');
    elements.revealElements = document.querySelectorAll('[data-reveal]');
  }

  // ============================================
  // Internationalization (i18n)
  // ============================================
  async function initLanguage() {
    // Get saved language or use default
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    state.currentLang = CONFIG.supportedLangs.includes(savedLang) ? savedLang : CONFIG.defaultLang;

    // Load translations
    await loadTranslations(state.currentLang);

    // Set up language switcher
    setupLanguageSwitcher();

    // Apply translations
    applyTranslations();
  }

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load translations');
      state.translations = await response.json();

      // Update document lang attribute
      document.documentElement.lang = lang;

      // Update meta
      if (state.translations.meta) {
        document.title = state.translations.meta.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.content = state.translations.meta.description;
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to default language if current fails
      if (lang !== CONFIG.defaultLang) {
        await loadTranslations(CONFIG.defaultLang);
      }
    }
  }

  function setupLanguageSwitcher() {
    elements.langButtons.forEach(btn => {
      const lang = btn.dataset.lang;

      // Set active state
      btn.classList.toggle('active', lang === state.currentLang);

      // Add click handler
      btn.addEventListener('click', () => switchLanguage(lang));
    });
  }

  async function switchLanguage(lang) {
    if (lang === state.currentLang || !CONFIG.supportedLangs.includes(lang)) return;

    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);

    await loadTranslations(lang);
    applyTranslations();

    // Update active states
    elements.langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.dataset.i18n;
      const translation = getNestedTranslation(key);

      if (translation) {
        // Handle different element types
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder !== undefined && key.includes('placeholder')) {
            el.placeholder = translation;
          } else {
            el.value = translation;
          }
        } else {
          el.textContent = translation;
        }
      }
    });

    // Handle placeholder attributes separately
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const translation = getNestedTranslation(key);
      if (translation) {
        el.placeholder = translation;
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

  // ============================================
  // Navigation
  // ============================================
  function initNavigation() {
    // Mobile menu toggle
    if (elements.mobileMenuBtn && elements.mobileMenu) {
      elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

      // Close menu when clicking a link
      const mobileLinks = elements.mobileMenu.querySelectorAll('.mobile-menu-link');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
    });
  }

  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.mobileMenuBtn.classList.toggle('active', state.isMenuOpen);
    elements.mobileMenu.classList.toggle('active', state.isMenuOpen);
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    state.isMenuOpen = false;
    elements.mobileMenuBtn.classList.remove('active');
    elements.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  function handleSmoothScroll(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  // ============================================
  // Scroll Effects
  // ============================================
  function initScrollEffects() {
    // Initial check
    handleScroll();

    // Scroll listener with throttle
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
  }

  function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    const shouldBeScrolled = scrollY > CONFIG.scrollOffset;
    if (shouldBeScrolled !== state.isScrolled) {
      state.isScrolled = shouldBeScrolled;
      elements.navbar.classList.toggle('scrolled', shouldBeScrolled);
    }
  }

  // ============================================
  // Animations
  // ============================================
  function initAnimations() {
    // Intersection Observer for reveal animations
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: CONFIG.animationThreshold,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      elements.revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback: show all elements immediately
      elements.revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // ============================================
  // Mock UI Interactions
  // ============================================
  function initMockUI() {
    const calendarDays = document.querySelectorAll('.mock-calendar-day');

    calendarDays.forEach(day => {
      day.addEventListener('click', () => {
        calendarDays.forEach(d => d.classList.remove('active'));
        day.classList.add('active');
      });
    });

    const sidebarItems = document.querySelectorAll('.mock-sidebar-item');
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // ============================================
  // Pricing Toggle
  // ============================================
  function initPricingToggle() {
    const toggle = document.querySelector('.pricing-toggle-switch');
    const monthlyLabel = document.querySelector('.pricing-toggle-label:first-child');
    const yearlyLabel = document.querySelector('.pricing-toggle-label:last-child');

    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        monthlyLabel.classList.toggle('active');
        yearlyLabel.classList.toggle('active');

        // Here you could update prices based on monthly/yearly
        // For demo purposes, we just toggle the visual state
      });
    }
  }

  // ============================================
  // Contact Form
  // ============================================
  function initContactForm() {
    const form = document.querySelector('.contact-form');

    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Simulate form submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = state.currentLang === 'es' ? 'Enviando...' : 'Sending...';

    setTimeout(() => {
      submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
      submitBtn.classList.add('btn-success');

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('btn-success');
        e.target.reset();
      }, 2000);
    }, 1500);
  }

  // ============================================
  // Utility Functions
  // ============================================
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

  // ============================================
  // Start Application
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
