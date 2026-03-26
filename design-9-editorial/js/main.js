/**
 * Design 9 - Editorial/Newspaper
 * Main JavaScript File
 *
 * Handles:
 * - Language switching (ES/EN)
 * - Mobile navigation
 * - Smooth scrolling
 * - Form handling
 * - Animations on scroll
 */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore_language',
    animationThreshold: 0.1,
    turnosMedicosUrl: 'https://login.turnosmedicos.com'
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let currentLang = CONFIG.defaultLang;
  let translations = {};
  let isMenuOpen = false;

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const elements = {
    html: document.documentElement,
    body: document.body,
    langToggle: null,
    mobileToggle: null,
    mobileMenu: null,
    navLinks: null,
    form: null
  };

  // ==========================================================================
  // Language System
  // ==========================================================================

  /**
   * Load translations from JSON files
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang} translations`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      return null;
    }
  }

  /**
   * Get nested property from object using dot notation
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  function applyTranslations() {
    if (!translations[currentLang]) return;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(translations[currentLang], key);

      if (value) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          if (element.placeholder !== undefined) {
            element.placeholder = value;
          }
        } else {
          element.textContent = value;
        }
      }
    });

    // Update HTML lang attribute
    elements.html.setAttribute('lang', currentLang);

    // Update page title
    const title = getNestedValue(translations[currentLang], 'meta.title');
    if (title) {
      document.title = title;
    }

    // Update meta description
    const description = getNestedValue(translations[currentLang], 'meta.description');
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }

  /**
   * Switch language
   */
  async function switchLanguage(lang) {
    if (lang === currentLang && translations[lang]) return;

    if (!translations[lang]) {
      translations[lang] = await loadTranslations(lang);
    }

    if (translations[lang]) {
      currentLang = lang;
      localStorage.setItem(CONFIG.storageKey, lang);
      applyTranslations();
      updateLangToggle();
    }
  }

  /**
   * Update language toggle button text
   */
  function updateLangToggle() {
    if (elements.langToggle) {
      elements.langToggle.textContent = currentLang.toUpperCase();
    }
  }

  /**
   * Initialize language system
   */
  async function initLanguage() {
    // Check for saved language preference
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    if (savedLang && ['es', 'en'].includes(savedLang)) {
      currentLang = savedLang;
    }

    // Load initial translations
    translations[currentLang] = await loadTranslations(currentLang);
    applyTranslations();
    updateLangToggle();
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;

    if (elements.mobileMenu) {
      elements.mobileMenu.classList.toggle('is-open', isMenuOpen);
    }

    if (elements.mobileToggle) {
      elements.mobileToggle.setAttribute('aria-expanded', isMenuOpen);
    }

    // Prevent body scroll when menu is open
    elements.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    if (isMenuOpen) {
      toggleMobileMenu();
    }
  }

  /**
   * Handle navigation link clicks
   */
  function handleNavClick(e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      closeMobileMenu();

      const navHeight = elements.body.querySelector('.nav')?.offsetHeight || 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Initialize navigation
   */
  function initNavigation() {
    elements.mobileToggle = document.querySelector('.nav__toggle');
    elements.mobileMenu = document.querySelector('.nav__mobile-menu');
    elements.navLinks = document.querySelectorAll('.nav__link, .nav__mobile-link');

    if (elements.mobileToggle) {
      elements.mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking on links
    document.addEventListener('click', handleNavClick);

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMobileMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isMenuOpen && !e.target.closest('.nav__mobile-menu') && !e.target.closest('.nav__toggle')) {
        closeMobileMenu();
      }
    });
  }

  // ==========================================================================
  // Language Toggle
  // ==========================================================================

  /**
   * Initialize language toggle
   */
  function initLangToggle() {
    elements.langToggle = document.querySelector('.nav__lang');

    if (elements.langToggle) {
      elements.langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'es' ? 'en' : 'es';
        switchLanguage(newLang);
      });
    }
  }

  // ==========================================================================
  // Form Handling
  // ==========================================================================

  /**
   * Handle form submission
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Here you would typically send the data to a server
    console.log('Form submitted:', data);

    // Show success message (in production, replace with actual submission)
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = currentLang === 'es' ? 'Enviado!' : 'Sent!';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 2000);
  }

  /**
   * Initialize form handling
   */
  function initForm() {
    elements.form = document.querySelector('.contact__form');

    if (elements.form) {
      elements.form.addEventListener('submit', handleFormSubmit);
    }
  }

  // ==========================================================================
  // Scroll Animations
  // ==========================================================================

  /**
   * Initialize intersection observer for scroll animations
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section, .service-card, .pricing-card');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

  // ==========================================================================
  // TurnosMedicos Link
  // ==========================================================================

  /**
   * Initialize TurnosMedicos product links
   */
  function initProductLinks() {
    const productLinks = document.querySelectorAll('[data-product-link]');

    productLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(CONFIG.turnosMedicosUrl, '_blank', 'noopener,noreferrer');
      });
    });
  }

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Debounce function for performance optimization
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
   * Handle window resize
   */
  const handleResize = debounce(() => {
    // Close mobile menu on larger screens
    if (window.innerWidth >= 1024 && isMenuOpen) {
      closeMobileMenu();
    }
  }, 250);

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize all modules
   */
  async function init() {
    // Cache DOM elements
    elements.html = document.documentElement;
    elements.body = document.body;

    // Initialize modules
    await initLanguage();
    initLangToggle();
    initNavigation();
    initForm();
    initProductLinks();
    initScrollAnimations();

    // Event listeners
    window.addEventListener('resize', handleResize);

    // Mark page as loaded
    elements.body.classList.add('is-loaded');
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
