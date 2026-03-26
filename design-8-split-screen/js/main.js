/**
 * TurnosMedicos - Split Screen Design
 * Main JavaScript File
 */

(function() {
  'use strict';

  // ============================================
  // LANGUAGE MANAGEMENT
  // ============================================

  const LanguageManager = {
    currentLang: 'es',
    translations: {},

    async init() {
      this.currentLang = localStorage.getItem('doctore-lang') || 'es';
      await this.loadTranslations(this.currentLang);
      this.updateUI();
      this.bindEvents();
    },

    async loadTranslations(lang) {
      try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Translation file not found');
        this.translations = await response.json();
      } catch (error) {
        console.error('Error loading translations:', error);
        if (lang !== 'es') {
          await this.loadTranslations('es');
        }
      }
    },

    async switchLanguage(lang) {
      if (lang === this.currentLang) return;

      this.currentLang = lang;
      localStorage.setItem('doctore-lang', lang);
      await this.loadTranslations(lang);
      this.updateUI();
      this.updateLangButtons();
    },

    updateUI() {
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.getNestedTranslation(key);

        if (translation) {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
          } else {
            element.innerHTML = translation;
          }
        }
      });

      document.documentElement.lang = this.currentLang;
    },

    getNestedTranslation(key) {
      return key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
    },

    updateLangButtons() {
      document.querySelectorAll('.nav__lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
      });
    },

    bindEvents() {
      document.querySelectorAll('.nav__lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchLanguage(btn.dataset.lang);
        });
      });

      this.updateLangButtons();
    }
  };

  // ============================================
  // NAVIGATION
  // ============================================

  const Navigation = {
    nav: null,
    toggle: null,
    menu: null,
    links: null,

    init() {
      this.nav = document.querySelector('.nav');
      this.toggle = document.querySelector('.nav__mobile-toggle');
      this.menu = document.querySelector('.nav__menu');
      this.links = document.querySelectorAll('.nav__link');

      if (!this.nav) return;

      this.bindEvents();
      this.handleScroll();
    },

    bindEvents() {
      window.addEventListener('scroll', () => this.handleScroll());

      if (this.toggle && this.menu) {
        this.toggle.addEventListener('click', () => this.toggleMobileMenu());

        this.links.forEach(link => {
          link.addEventListener('click', () => this.closeMobileMenu());
        });

        document.addEventListener('click', (e) => {
          if (!this.nav.contains(e.target) && this.menu.classList.contains('active')) {
            this.closeMobileMenu();
          }
        });
      }
    },

    handleScroll() {
      const scrolled = window.scrollY > 50;
      this.nav.classList.toggle('scrolled', scrolled);
    },

    toggleMobileMenu() {
      this.toggle.classList.toggle('active');
      this.menu.classList.toggle('active');
      document.body.style.overflow = this.menu.classList.contains('active') ? 'hidden' : '';
    },

    closeMobileMenu() {
      this.toggle.classList.remove('active');
      this.menu.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ============================================
  // SMOOTH SCROLL
  // ============================================

  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;

          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================

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

  // ============================================
  // CONTACT FORM
  // ============================================

  const ContactForm = {
    form: null,

    init() {
      this.form = document.querySelector('.contact__form');
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    handleSubmit(e) {
      e.preventDefault();

      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Simulate form submission
      const submitBtn = this.form.querySelector('.contact__form-submit');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading">...</span>';

      setTimeout(() => {
        submitBtn.innerHTML = LanguageManager.translations.contact?.form?.success || 'Message sent!';
        submitBtn.classList.add('btn-secondary');

        setTimeout(() => {
          this.form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('btn-secondary');
        }, 3000);
      }, 1500);
    }
  };

  // ============================================
  // COUNTER ANIMATION
  // ============================================

  const CounterAnimation = {
    init() {
      const counters = document.querySelectorAll('[data-counter]');

      if (!counters.length) return;

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
      const target = parseInt(element.dataset.counter, 10);
      const suffix = element.dataset.suffix || '';
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const update = () => {
        current += step;
        if (current < target) {
          element.textContent = Math.floor(current) + suffix;
          requestAnimationFrame(update);
        } else {
          element.textContent = target + suffix;
        }
      };

      update();
    }
  };

  // ============================================
  // PARALLAX EFFECTS
  // ============================================

  const ParallaxEffects = {
    elements: [],

    init() {
      this.elements = document.querySelectorAll('[data-parallax]');

      if (!this.elements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      window.addEventListener('scroll', () => this.update(), { passive: true });
    },

    update() {
      const scrollY = window.scrollY;

      this.elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const rect = el.getBoundingClientRect();
        const visible = rect.top < window.innerHeight && rect.bottom > 0;

        if (visible) {
          const offset = scrollY * speed;
          el.style.transform = `translateY(${offset}px)`;
        }
      });
    }
  };

  // ============================================
  // INITIALIZE
  // ============================================

  document.addEventListener('DOMContentLoaded', async () => {
    await LanguageManager.init();
    Navigation.init();
    SmoothScroll.init();
    ScrollAnimations.init();
    ContactForm.init();
    CounterAnimation.init();
    ParallaxEffects.init();
  });

})();
