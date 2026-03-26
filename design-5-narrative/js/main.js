/* ============================================
   Narrative Flow Landing Page - Main JavaScript
   doctore.ar
   ============================================ */

(function() {
  'use strict';

  /* ============================================
     Configuration
     ============================================ */

  const CONFIG = {
    defaultLang: 'es',
    supportedLangs: ['es', 'en'],
    storageKey: 'doctore-lang',
    animationThreshold: 0.15,
    animationRootMargin: '0px 0px -50px 0px'
  };

  /* ============================================
     State
     ============================================ */

  let currentLang = CONFIG.defaultLang;
  let translations = {};

  /* ============================================
     DOM Elements
     ============================================ */

  const elements = {
    nav: null,
    langButtons: null,
    revealElements: null,
    progressDots: null,
    sections: null
  };

  /* ============================================
     Initialization
     ============================================ */

  function init() {
    cacheElements();
    initLanguage();
    initNavScroll();
    initRevealAnimations();
    initProgressIndicator();
    initSmoothScroll();
  }

  function cacheElements() {
    elements.nav = document.querySelector('.nav');
    elements.langButtons = document.querySelectorAll('.nav__lang-btn');
    elements.revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    elements.progressDots = document.querySelectorAll('.progress-indicator__dot');
    elements.sections = document.querySelectorAll('section[id]');
  }

  /* ============================================
     Language System
     ============================================ */

  async function initLanguage() {
    // Get saved language or detect from browser
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    const browserLang = navigator.language.split('-')[0];

    currentLang = savedLang ||
      (CONFIG.supportedLangs.includes(browserLang) ? browserLang : CONFIG.defaultLang);

    // Load translations
    await loadTranslations(currentLang);
    applyTranslations();
    updateLangButtons();

    // Add event listeners to language buttons
    elements.langButtons.forEach(function(btn) {
      btn.addEventListener('click', handleLangSwitch);
    });
  }

  async function loadTranslations(lang) {
    try {
      const response = await fetch('./lang/' + lang + '.json');
      if (!response.ok) {
        throw new Error('Failed to load translations');
      }
      translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to default language if current fails
      if (lang !== CONFIG.defaultLang) {
        await loadTranslations(CONFIG.defaultLang);
      }
    }
  }

  function applyTranslations() {
    const translatableElements = document.querySelectorAll('[data-i18n]');

    translatableElements.forEach(function(element) {
      const key = element.getAttribute('data-i18n');
      const translation = getNestedTranslation(key);

      if (translation) {
        // Check if element has a placeholder attribute
        if (element.hasAttribute('placeholder')) {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
  }

  function getNestedTranslation(key) {
    const keys = key.split('.');
    let value = translations;

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  async function handleLangSwitch(event) {
    const btn = event.currentTarget;
    const lang = btn.getAttribute('data-lang');

    if (lang === currentLang) return;

    currentLang = lang;
    localStorage.setItem(CONFIG.storageKey, lang);

    await loadTranslations(lang);
    applyTranslations();
    updateLangButtons();
  }

  function updateLangButtons() {
    elements.langButtons.forEach(function(btn) {
      const isActive = btn.getAttribute('data-lang') === currentLang;
      btn.classList.toggle('active', isActive);
    });
  }

  /* ============================================
     Navigation Scroll Effect
     ============================================ */

  function initNavScroll() {
    var scrollHandler = function() {
      var scrolled = window.scrollY > 50;
      elements.nav.classList.toggle('scrolled', scrolled);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler(); // Initial check
  }

  /* ============================================
     Reveal Animations (Intersection Observer)
     ============================================ */

  function initRevealAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      elements.revealElements.forEach(function(el) {
        el.classList.add('active');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.animationThreshold,
      rootMargin: CONFIG.animationRootMargin
    });

    elements.revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ============================================
     Progress Indicator
     ============================================ */

  function initProgressIndicator() {
    if (elements.sections.length === 0 || elements.progressDots.length === 0) return;

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var sectionId = entry.target.id;
          updateProgressIndicator(sectionId);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-20% 0px -20% 0px'
    });

    elements.sections.forEach(function(section) {
      observer.observe(section);
    });

    // Add click handlers to progress dots
    elements.progressDots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var targetId = dot.getAttribute('data-section');
        var targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function updateProgressIndicator(sectionId) {
    elements.progressDots.forEach(function(dot) {
      var isActive = dot.getAttribute('data-section') === sectionId;
      dot.classList.toggle('active', isActive);
    });
  }

  /* ============================================
     Smooth Scroll for Anchor Links
     ============================================ */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');

        // Skip empty hashes
        if (href === '#') return;

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ============================================
     Start Application
     ============================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
