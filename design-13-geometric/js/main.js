/**
 * Geometric Design - Main JavaScript
 * doctore.ar Landing Page
 */

(function() {
  'use strict';

  // ==========================================================================
  // Language Management
  // ==========================================================================

  const LanguageManager = {
    currentLang: 'es',
    translations: {},

    async init() {
      const savedLang = localStorage.getItem('doctore-lang') || 'es';
      await this.loadLanguage(savedLang);
      this.bindEvents();
    },

    async loadLanguage(lang) {
      try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Language file not found');
        this.translations = await response.json();
        this.currentLang = lang;
        localStorage.setItem('doctore-lang', lang);
        this.updateUI();
        this.updateLangButton();
      } catch (error) {
        console.error('Error loading language:', error);
        if (lang !== 'es') {
          await this.loadLanguage('es');
        }
      }
    },

    updateUI() {
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.getTranslation(key);
        if (translation) {
          element.textContent = translation;
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = this.getTranslation(key);
        if (translation) {
          element.placeholder = translation;
        }
      });

      document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        const translation = this.getTranslation(key);
        if (translation) {
          element.setAttribute('aria-label', translation);
        }
      });

      document.documentElement.lang = this.currentLang;
    },

    getTranslation(key) {
      const keys = key.split('.');
      let value = this.translations;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return null;
        }
      }
      return typeof value === 'string' ? value : null;
    },

    updateLangButton() {
      const langBtn = document.querySelector('.nav__lang-btn');
      if (langBtn) {
        const langText = langBtn.querySelector('span');
        if (langText) {
          langText.textContent = this.currentLang.toUpperCase();
        }
      }
    },

    bindEvents() {
      const langBtn = document.querySelector('.nav__lang-btn');
      if (langBtn) {
        langBtn.addEventListener('click', () => {
          const newLang = this.currentLang === 'es' ? 'en' : 'es';
          this.loadLanguage(newLang);
        });
      }
    },

    toggleLanguage() {
      const newLang = this.currentLang === 'es' ? 'en' : 'es';
      this.loadLanguage(newLang);
    }
  };

  // ==========================================================================
  // Navigation
  // ==========================================================================

  const Navigation = {
    nav: null,
    mobileToggle: null,
    mobileMenu: null,
    isScrolled: false,

    init() {
      this.nav = document.querySelector('.nav');
      this.mobileToggle = document.querySelector('.nav__mobile-toggle');
      this.mobileMenu = document.querySelector('.nav__mobile-menu');

      if (!this.nav) return;

      this.bindEvents();
      this.checkScroll();
    },

    bindEvents() {
      window.addEventListener('scroll', () => this.checkScroll(), { passive: true });

      if (this.mobileToggle && this.mobileMenu) {
        this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
      }

      document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
        link.addEventListener('click', (e) => this.handleNavClick(e));
      });

      document.addEventListener('click', (e) => {
        if (this.mobileMenu &&
            this.mobileMenu.classList.contains('nav__mobile-menu--active') &&
            !this.mobileMenu.contains(e.target) &&
            !this.mobileToggle.contains(e.target)) {
          this.closeMobileMenu();
        }
      });
    },

    checkScroll() {
      const scrolled = window.scrollY > 50;
      if (scrolled !== this.isScrolled) {
        this.isScrolled = scrolled;
        this.nav.classList.toggle('nav--scrolled', scrolled);
      }
    },

    toggleMobileMenu() {
      this.mobileToggle.classList.toggle('nav__mobile-toggle--active');
      this.mobileMenu.classList.toggle('nav__mobile-menu--active');
      document.body.style.overflow = this.mobileMenu.classList.contains('nav__mobile-menu--active') ? 'hidden' : '';
    },

    closeMobileMenu() {
      this.mobileToggle.classList.remove('nav__mobile-toggle--active');
      this.mobileMenu.classList.remove('nav__mobile-menu--active');
      document.body.style.overflow = '';
    },

    handleNavClick(e) {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          this.closeMobileMenu();
          const navHeight = this.nav.offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // ==========================================================================
  // Scroll Animations
  // ==========================================================================

  const ScrollAnimations = {
    observer: null,

    init() {
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('[data-animate]').forEach(el => {
          el.classList.add('animated');
        });
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('[data-animate]').forEach(el => {
        this.observer.observe(el);
      });
    }
  };

  // ==========================================================================
  // Form Handling
  // ==========================================================================

  const FormHandler = {
    form: null,

    init() {
      this.form = document.querySelector('.contact__form');
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    handleSubmit(e) {
      e.preventDefault();

      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      // Simulate form submission
      const submitBtn = this.form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = LanguageManager.currentLang === 'es' ? 'Enviando...' : 'Sending...';

      setTimeout(() => {
        submitBtn.textContent = LanguageManager.currentLang === 'es' ? 'Enviado!' : 'Sent!';
        this.form.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 2000);
      }, 1500);
    }
  };

  // ==========================================================================
  // Geometric Shapes Animation
  // ==========================================================================

  const GeometricShapes = {
    shapes: [],

    init() {
      this.shapes = document.querySelectorAll('.hero__shape');
      if (this.shapes.length === 0) return;

      this.animateOnScroll();
    },

    animateOnScroll() {
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            this.shapes.forEach((shape, index) => {
              const speed = (index + 1) * 0.05;
              const yPos = scrollY * speed;
              const rotation = scrollY * 0.02 * (index % 2 === 0 ? 1 : -1);
              shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  };

  // ==========================================================================
  // Counter Animation
  // ==========================================================================

  const CounterAnimation = {
    init() {
      const counters = document.querySelectorAll('.about__stat-value');
      if (counters.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
      const text = element.textContent;
      const match = text.match(/(\d+)/);
      if (!match) return;

      const target = parseInt(match[1], 10);
      const suffix = text.replace(match[1], '');
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target + suffix;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + suffix;
        }
      }, 16);
    }
  };

  // ==========================================================================
  // Initialize
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', async () => {
    await LanguageManager.init();
    Navigation.init();
    ScrollAnimations.init();
    FormHandler.init();
    GeometricShapes.init();
    CounterAnimation.init();
  });

})();
