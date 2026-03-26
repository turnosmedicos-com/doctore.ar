/**
 * doctore.ar - Dashboard Preview Design
 * Main JavaScript file
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore_lang',
    animationThreshold: 0.1,
    turnosMedicosUrl: 'https://login.turnosmedicos.com'
  };

  // ============================================
  // State Management
  // ============================================
  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    html: document.documentElement,
    body: document.body,
    navToggle: null,
    navMobile: null,
    langButtons: null,
    animatedElements: null
  };

  // ============================================
  // Initialize
  // ============================================
  async function init() {
    cacheElements();
    await loadTranslations();
    bindEvents();
    initLanguage();
    initAnimations();
    initChartBars();
  }

  // ============================================
  // Cache DOM Elements
  // ============================================
  function cacheElements() {
    elements.navToggle = document.querySelector('.nav__toggle');
    elements.navMobile = document.querySelector('.nav__mobile');
    elements.langButtons = document.querySelectorAll('.nav__lang-btn');
    elements.animatedElements = document.querySelectorAll('[data-animate]');
  }

  // ============================================
  // Event Binding
  // ============================================
  function bindEvents() {
    // Mobile menu toggle
    if (elements.navToggle) {
      elements.navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Language switcher
    elements.langButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = this.getAttribute('data-lang');
        setLanguage(lang);
      });
    });

    // Close mobile menu on link click
    var mobileLinks = document.querySelectorAll('.nav__mobile-link');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function(e) {
      if (state.isMenuOpen && !e.target.closest('.nav')) {
        closeMobileMenu();
      }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        var target = document.querySelector(targetId);
        if (target) {
          var offset = 80;
          var position = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          });
        }
      });
    });

    // Form submission
    var contactForm = document.querySelector('.contact__form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }
  }

  // ============================================
  // Mobile Menu
  // ============================================
  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    if (elements.navMobile) {
      elements.navMobile.classList.toggle('is-open', state.isMenuOpen);
    }
    if (elements.navToggle) {
      elements.navToggle.setAttribute('aria-expanded', state.isMenuOpen);
    }
  }

  function closeMobileMenu() {
    state.isMenuOpen = false;
    if (elements.navMobile) {
      elements.navMobile.classList.remove('is-open');
    }
    if (elements.navToggle) {
      elements.navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // ============================================
  // Language Management
  // ============================================
  async function loadTranslations() {
    try {
      var esResponse = await fetch('./lang/es.json');
      var enResponse = await fetch('./lang/en.json');

      state.translations.es = await esResponse.json();
      state.translations.en = await enResponse.json();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  function initLanguage() {
    var savedLang = localStorage.getItem(CONFIG.storageKey);
    var browserLang = navigator.language.substring(0, 2);
    var lang = savedLang || (browserLang === 'en' ? 'en' : CONFIG.defaultLang);
    setLanguage(lang);
  }

  function setLanguage(lang) {
    if (!state.translations[lang]) {
      lang = CONFIG.defaultLang;
    }

    state.currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);
    elements.html.setAttribute('lang', lang);

    // Update language button states
    elements.langButtons.forEach(function(btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('nav__lang-btn--active', isActive);
    });

    // Update all translatable elements
    updateTranslations();
  }

  function updateTranslations() {
    var t = state.translations[state.currentLang];
    if (!t) return;

    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var value = getNestedValue(t, key);
      if (value) {
        if (el.hasAttribute('data-i18n-attr')) {
          var attr = el.getAttribute('data-i18n-attr');
          el.setAttribute(attr, value);
        } else {
          el.textContent = value;
        }
      }
    });

    // Update elements with data-i18n-html attribute (for innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-html');
      var value = getNestedValue(t, key);
      if (value) {
        el.innerHTML = value;
      }
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce(function(current, key) {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // ============================================
  // Animations
  // ============================================
  function initAnimations() {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      });

      elements.animatedElements.forEach(function(el) {
        el.style.opacity = '0';
        observer.observe(el);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      elements.animatedElements.forEach(function(el) {
        el.classList.add('fade-in');
      });
    }
  }

  // ============================================
  // Chart Bars Animation
  // ============================================
  function initChartBars() {
    var chartBars = document.querySelectorAll('.hero__stat-bar');
    var heights = [40, 60, 45, 80, 55, 70, 90, 65, 75, 85, 50, 95];

    chartBars.forEach(function(bar, index) {
      var height = heights[index % heights.length];
      bar.style.height = height + '%';
    });

    // Animate progress bars on scroll
    var progressBars = document.querySelectorAll('.service-card__progress-fill, .turnosmedicos__mini-progress-bar');

    if ('IntersectionObserver' in window) {
      var progressObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var width = entry.target.getAttribute('data-progress');
            if (width) {
              entry.target.style.width = width + '%';
            }
            progressObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });

      progressBars.forEach(function(bar) {
        var width = bar.getAttribute('data-progress');
        if (width) {
          bar.style.width = '0%';
          progressObserver.observe(bar);
        }
      });
    }
  }

  // ============================================
  // Form Handling
  // ============================================
  function handleFormSubmit(e) {
    e.preventDefault();

    var form = e.target;
    var formData = new FormData(form);
    var data = {};

    formData.forEach(function(value, key) {
      data[key] = value;
    });

    // Simulate form submission
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = state.currentLang === 'es' ? 'Enviando...' : 'Sending...';

    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
      form.reset();

      setTimeout(function() {
        submitBtn.textContent = originalText;
      }, 2000);
    }, 1500);
  }

  // ============================================
  // Utility Functions
  // ============================================
  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  // ============================================
  // Initialize on DOM Ready
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
