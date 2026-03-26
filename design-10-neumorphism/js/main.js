/**
 * Doctore.ar - Neumorphism Design
 * Main JavaScript File
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore_lang',
    scrollThreshold: 50,
    animationDuration: 300
  };

  // ============================================
  // STATE
  // ============================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false,
    isScrolled: false
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const elements = {
    nav: null,
    mobileToggle: null,
    mobileMenu: null,
    langButtons: null,
    scrollTopBtn: null,
    translatableElements: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    cacheElements();
    loadSavedLanguage();
    loadTranslations().then(() => {
      applyTranslations();
      setupEventListeners();
      handleScroll();
    });
  }

  function cacheElements() {
    elements.nav = document.querySelector('.nav');
    elements.mobileToggle = document.querySelector('.nav__mobile-toggle');
    elements.mobileMenu = document.querySelector('.nav__mobile-menu');
    elements.langButtons = document.querySelectorAll('.nav__lang-btn');
    elements.scrollTopBtn = document.querySelector('.scroll-top');
    elements.translatableElements = document.querySelectorAll('[data-i18n]');
  }

  // ============================================
  // LANGUAGE MANAGEMENT
  // ============================================

  function loadSavedLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      state.currentLang = savedLang;
    }
  }

  async function loadTranslations() {
    try {
      const [esResponse, enResponse] = await Promise.all([
        fetch('./lang/es.json'),
        fetch('./lang/en.json')
      ]);

      state.translations.es = await esResponse.json();
      state.translations.en = await enResponse.json();
    } catch (error) {
      handleError('Error loading translations', error);
    }
  }

  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return;

    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);
    document.documentElement.lang = lang;

    applyTranslations();
    updateLangButtons();
  }

  function applyTranslations() {
    const translations = state.translations[state.currentLang];
    if (!translations) return;

    document.documentElement.lang = state.currentLang;

    // Update meta tags
    document.title = translations.meta.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = translations.meta.description;
    }

    // Update all translatable elements
    elements.translatableElements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);

      if (value !== undefined) {
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = value;
        } else if (element.hasAttribute('placeholder')) {
          element.placeholder = value;
        } else {
          element.textContent = value;
        }
      }
    });

    updateLangButtons();
  }

  function updateLangButtons() {
    elements.langButtons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('nav__lang-btn--active', btnLang === state.currentLang);
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // ============================================
  // NAVIGATION
  // ============================================

  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.mobileToggle.classList.toggle('nav__mobile-toggle--active', state.isMenuOpen);
    elements.mobileMenu.classList.toggle('nav__mobile-menu--active', state.isMenuOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (!state.isMenuOpen) return;

    state.isMenuOpen = false;
    elements.mobileToggle.classList.remove('nav__mobile-toggle--active');
    elements.mobileMenu.classList.remove('nav__mobile-menu--active');
    document.body.style.overflow = '';
  }

  function handleScroll() {
    const scrolled = window.scrollY > CONFIG.scrollThreshold;

    if (scrolled !== state.isScrolled) {
      state.isScrolled = scrolled;
      elements.nav.classList.toggle('nav--scrolled', scrolled);
    }

    // Show/hide scroll to top button
    if (elements.scrollTopBtn) {
      elements.scrollTopBtn.classList.toggle('scroll-top--visible', window.scrollY > 500);
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link, .nav__mobile-link');

    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const isActive = href === `#${currentSection}`;
        link.classList.toggle('nav__link--active', isActive);
        link.classList.toggle('nav__mobile-link--active', isActive);
      }
    });
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function smoothScroll(event) {
    const href = event.currentTarget.getAttribute('href');

    if (href && href.startsWith('#')) {
      event.preventDefault();
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
    }
  }

  // ============================================
  // FORM HANDLING
  // ============================================

  function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate form
    if (!validateForm(data)) {
      return;
    }

    // Show success feedback (in a real app, this would send the data to a server)
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = state.currentLang === 'es' ? 'Enviando...' : 'Sending...';
    submitBtn.classList.add('neu-btn--pressed');

    // Simulate API call
    setTimeout(() => {
      submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
      submitBtn.classList.remove('neu-btn--pressed');

      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 2000);
    }, 1500);
  }

  function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name || data.name.trim().length < 2) {
      showFormError('name', state.currentLang === 'es' ? 'Nombre requerido' : 'Name required');
      return false;
    }

    if (!data.email || !emailRegex.test(data.email)) {
      showFormError('email', state.currentLang === 'es' ? 'Email inválido' : 'Invalid email');
      return false;
    }

    if (!data.message || data.message.trim().length < 10) {
      showFormError('message', state.currentLang === 'es' ? 'Mensaje muy corto' : 'Message too short');
      return false;
    }

    return true;
  }

  function showFormError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.focus();
      // Could add visual error state here
    }
  }

  // ============================================
  // ANIMATIONS
  // ============================================

  function setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    document.querySelectorAll('.neu-card, .service-card, .pricing-card').forEach(el => {
      observer.observe(el);
    });
  }

  // ============================================
  // NEUMORPHIC INTERACTIONS
  // ============================================

  function setupNeumorphicInteractions() {
    // Add press effect to all neumorphic buttons
    document.querySelectorAll('.neu-btn').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        btn.classList.add('neu-btn--pressed');
      });

      btn.addEventListener('mouseup', () => {
        btn.classList.remove('neu-btn--pressed');
      });

      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('neu-btn--pressed');
      });
    });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function setupEventListeners() {
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

    // Scroll events
    window.addEventListener('scroll', throttle(handleScroll, 100));

    // Scroll to top button
    if (elements.scrollTopBtn) {
      elements.scrollTopBtn.addEventListener('click', scrollToTop);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', smoothScroll);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (state.isMenuOpen &&
          !elements.mobileMenu.contains(event.target) &&
          !elements.mobileToggle.contains(event.target)) {
        closeMobileMenu();
      }
    });

    // Form submission
    const contactForm = document.querySelector('.contact__form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Setup animations
    if ('IntersectionObserver' in window) {
      setupIntersectionObserver();
    }

    // Setup neumorphic interactions
    setupNeumorphicInteractions();

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && state.isMenuOpen) {
        closeMobileMenu();
      }
    }, 250));
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

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

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function handleError(message, error) {
    // In production, this would send to a logging service
    if (typeof console !== 'undefined' && console.error) {
      console.error(message, error);
    }
  }

  // ============================================
  // START APPLICATION
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
