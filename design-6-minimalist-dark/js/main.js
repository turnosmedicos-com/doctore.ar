/**
 * DOCTORE.AR - Design 6: Minimalist Dark
 * Main JavaScript
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore_lang',
    animationThreshold: 0.1,
    turnosMedicosUrl: 'https://login.turnosmedicos.com'
  };

  // ============================================
  // STATE
  // ============================================

  const state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false
  };

  // ============================================
  // DOM ELEMENTS
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
  // LANGUAGE SYSTEM
  // ============================================

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      return await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      return null;
    }
  }

  async function setLanguage(lang) {
    const translations = await loadTranslations(lang);
    if (!translations) return;

    state.currentLang = lang;
    state.translations = translations;

    localStorage.setItem(CONFIG.storageKey, lang);
    elements.html.setAttribute('lang', lang);

    applyTranslations(translations);
    updateLangButtons(lang);
  }

  function applyTranslations(t) {
    // Meta
    document.title = t.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.meta.description);

    // Navigation
    updateElement('[data-i18n="nav.home"]', t.nav.home);
    updateElement('[data-i18n="nav.product"]', t.nav.product);
    updateElement('[data-i18n="nav.services"]', t.nav.services);
    updateElement('[data-i18n="nav.pricing"]', t.nav.pricing);
    updateElement('[data-i18n="nav.about"]', t.nav.about);
    updateElement('[data-i18n="nav.contact"]', t.nav.contact);
    updateElement('[data-i18n="nav.login"]', t.nav.login);

    // Hero
    updateElement('[data-i18n="hero.label"]', t.hero.label);
    updateElement('[data-i18n="hero.title"]', t.hero.title, true);
    updateElement('[data-i18n="hero.subtitle"]', t.hero.subtitle);
    updateElement('[data-i18n="hero.cta_primary"]', t.hero.cta_primary);
    updateElement('[data-i18n="hero.cta_secondary"]', t.hero.cta_secondary);
    updateElement('[data-i18n="hero.stats.professionals.number"]', t.hero.stats.professionals.number);
    updateElement('[data-i18n="hero.stats.professionals.label"]', t.hero.stats.professionals.label);
    updateElement('[data-i18n="hero.stats.appointments.number"]', t.hero.stats.appointments.number);
    updateElement('[data-i18n="hero.stats.appointments.label"]', t.hero.stats.appointments.label);
    updateElement('[data-i18n="hero.stats.uptime.number"]', t.hero.stats.uptime.number);
    updateElement('[data-i18n="hero.stats.uptime.label"]', t.hero.stats.uptime.label);

    // Product
    updateElement('[data-i18n="product.label"]', t.product.label);
    updateElement('[data-i18n="product.title"]', t.product.title);
    updateElement('[data-i18n="product.subtitle"]', t.product.subtitle);
    updateElement('[data-i18n="product.cta"]', t.product.cta);
    updateElement('[data-i18n="product.badge"]', t.product.badge);

    const productFeatures = document.querySelectorAll('[data-i18n^="product.features."]');
    productFeatures.forEach((el, index) => {
      if (t.product.features[index]) {
        el.textContent = t.product.features[index];
      }
    });

    // Services
    updateElement('[data-i18n="services.label"]', t.services.label);
    updateElement('[data-i18n="services.title"]', t.services.title);
    updateElement('[data-i18n="services.subtitle"]', t.services.subtitle);

    t.services.items.forEach((item, index) => {
      updateElement(`[data-i18n="services.items.${index}.number"]`, item.number);
      updateElement(`[data-i18n="services.items.${index}.title"]`, item.title);
      updateElement(`[data-i18n="services.items.${index}.description"]`, item.description);
    });

    // Pricing
    updateElement('[data-i18n="pricing.label"]', t.pricing.label);
    updateElement('[data-i18n="pricing.title"]', t.pricing.title);
    updateElement('[data-i18n="pricing.subtitle"]', t.pricing.subtitle);

    t.pricing.plans.forEach((plan, index) => {
      updateElement(`[data-i18n="pricing.plans.${index}.name"]`, plan.name);
      updateElement(`[data-i18n="pricing.plans.${index}.price"]`, plan.price);
      updateElement(`[data-i18n="pricing.plans.${index}.currency"]`, plan.currency);
      updateElement(`[data-i18n="pricing.plans.${index}.period"]`, plan.period);
      updateElement(`[data-i18n="pricing.plans.${index}.description"]`, plan.description);
      updateElement(`[data-i18n="pricing.plans.${index}.cta"]`, plan.cta);
      if (plan.badge) {
        updateElement(`[data-i18n="pricing.plans.${index}.badge"]`, plan.badge);
      }

      plan.features.forEach((feature, fIndex) => {
        updateElement(`[data-i18n="pricing.plans.${index}.features.${fIndex}"]`, feature);
      });
    });

    // About
    updateElement('[data-i18n="about.label"]', t.about.label);
    updateElement('[data-i18n="about.title"]', t.about.title);
    updateElement('[data-i18n="about.text1"]', t.about.text1);
    updateElement('[data-i18n="about.text2"]', t.about.text2);

    t.about.values.forEach((value, index) => {
      updateElement(`[data-i18n="about.values.${index}.number"]`, value.number);
      updateElement(`[data-i18n="about.values.${index}.title"]`, value.title);
      updateElement(`[data-i18n="about.values.${index}.description"]`, value.description);
    });

    t.about.cards.forEach((card, index) => {
      updateElement(`[data-i18n="about.cards.${index}.title"]`, card.title);
      updateElement(`[data-i18n="about.cards.${index}.description"]`, card.description);
    });

    // Contact
    updateElement('[data-i18n="contact.label"]', t.contact.label);
    updateElement('[data-i18n="contact.title"]', t.contact.title);
    updateElement('[data-i18n="contact.subtitle"]', t.contact.subtitle);
    updateElement('[data-i18n="contact.info.email.label"]', t.contact.info.email.label);
    updateElement('[data-i18n="contact.info.email.value"]', t.contact.info.email.value);
    updateElement('[data-i18n="contact.info.phone.label"]', t.contact.info.phone.label);
    updateElement('[data-i18n="contact.info.phone.value"]', t.contact.info.phone.value);
    updateElement('[data-i18n="contact.info.location.label"]', t.contact.info.location.label);
    updateElement('[data-i18n="contact.info.location.value"]', t.contact.info.location.value);
    updateElement('[data-i18n="contact.form.name.label"]', t.contact.form.name.label);
    updateElement('[data-i18n="contact.form.email.label"]', t.contact.form.email.label);
    updateElement('[data-i18n="contact.form.message.label"]', t.contact.form.message.label);
    updateElement('[data-i18n="contact.form.submit"]', t.contact.form.submit);

    updatePlaceholder('[data-i18n-placeholder="contact.form.name.placeholder"]', t.contact.form.name.placeholder);
    updatePlaceholder('[data-i18n-placeholder="contact.form.email.placeholder"]', t.contact.form.email.placeholder);
    updatePlaceholder('[data-i18n-placeholder="contact.form.message.placeholder"]', t.contact.form.message.placeholder);

    // Footer
    updateElement('[data-i18n="footer.tagline"]', t.footer.tagline);
    updateElement('[data-i18n="footer.nav.product.title"]', t.footer.nav.product.title);
    updateElement('[data-i18n="footer.nav.company.title"]', t.footer.nav.company.title);
    updateElement('[data-i18n="footer.nav.legal.title"]', t.footer.nav.legal.title);
    updateElement('[data-i18n="footer.copyright"]', t.footer.copyright);

    t.footer.nav.product.links.forEach((link, index) => {
      updateElement(`[data-i18n="footer.nav.product.links.${index}"]`, link.text);
    });
    t.footer.nav.company.links.forEach((link, index) => {
      updateElement(`[data-i18n="footer.nav.company.links.${index}"]`, link.text);
    });
    t.footer.nav.legal.links.forEach((link, index) => {
      updateElement(`[data-i18n="footer.nav.legal.links.${index}"]`, link.text);
    });
  }

  function updateElement(selector, value, isHTML = false) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (isHTML) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });
  }

  function updatePlaceholder(selector, value) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.setAttribute('placeholder', value);
    });
  }

  function updateLangButtons(activeLang) {
    if (!elements.langButtons) return;
    elements.langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === activeLang);
    });
  }

  function getInitialLanguage() {
    const stored = localStorage.getItem(CONFIG.storageKey);
    if (stored) return stored;

    const browserLang = navigator.language.slice(0, 2);
    return browserLang === 'en' ? 'en' : CONFIG.defaultLang;
  }

  // ============================================
  // NAVIGATION
  // ============================================

  function initNavigation() {
    elements.navToggle = document.querySelector('.nav-toggle');
    elements.navMobile = document.querySelector('.nav-mobile');

    if (elements.navToggle && elements.navMobile) {
      elements.navToggle.addEventListener('click', toggleMobileMenu);

      // Close menu when clicking links
      const mobileLinks = elements.navMobile.querySelectorAll('.nav-link');
      mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.navToggle.classList.toggle('active', state.isMenuOpen);
    elements.navMobile.classList.toggle('active', state.isMenuOpen);
    elements.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    state.isMenuOpen = false;
    elements.navToggle.classList.remove('active');
    elements.navMobile.classList.remove('active');
    elements.body.style.overflow = '';
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const navHeight = document.querySelector('.nav').offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================

  function initScrollAnimations() {
    elements.animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      });

      elements.animatedElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      elements.animatedElements.forEach(el => el.classList.add('visible'));
    }
  }

  // ============================================
  // FORM HANDLING
  // ============================================

  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Here you would typically send the data to your backend
      console.log('Form submitted:', data);

      // Show success message (you could enhance this)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
      }, 2000);
    });
  }

  // ============================================
  // LANGUAGE SWITCHER
  // ============================================

  function initLanguageSwitcher() {
    elements.langButtons = document.querySelectorAll('.lang-btn');

    elements.langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang && lang !== state.currentLang) {
          setLanguage(lang);
        }
      });
    });
  }

  // ============================================
  // EXTERNAL LINKS
  // ============================================

  function initExternalLinks() {
    // TurnosMedicos CTA buttons
    const turnosLinks = document.querySelectorAll('[data-turnosmedicos]');
    turnosLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(CONFIG.turnosMedicosUrl, '_blank', 'noopener,noreferrer');
      });
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Cache DOM elements
    elements.html = document.documentElement;
    elements.body = document.body;

    // Initialize modules
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initLanguageSwitcher();
    initExternalLinks();

    // Load initial language
    const initialLang = getInitialLanguage();
    setLanguage(initialLang);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
