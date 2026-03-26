/**
 * DESIGN 15 - RETRO MODERN
 * Main JavaScript
 */

(function() {
  'use strict';

  // ========================================================================
  // LANGUAGE SYSTEM
  // ========================================================================

  const LanguageManager = {
    currentLang: 'es',
    translations: {},

    async init() {
      const savedLang = localStorage.getItem('doctore-lang') || 'es';
      await this.loadTranslations(savedLang);
      this.setupEventListeners();
      this.updateUI();
    },

    async loadTranslations(lang) {
      try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Translation file not found');
        this.translations = await response.json();
        this.currentLang = lang;
        localStorage.setItem('doctore-lang', lang);
      } catch (error) {
        console.error('Error loading translations:', error);
        if (lang !== 'es') {
          await this.loadTranslations('es');
        }
      }
    },

    setupEventListeners() {
      document.querySelectorAll('[data-lang-switch]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const lang = e.target.dataset.langSwitch;
          if (lang !== this.currentLang) {
            await this.loadTranslations(lang);
            this.updateUI();
          }
        });
      });
    },

    updateUI() {
      // Update language switch buttons
      document.querySelectorAll('[data-lang-switch]').forEach(btn => {
        btn.classList.toggle('header__lang-btn--active', btn.dataset.langSwitch === this.currentLang);
      });

      // Update all translatable elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translation = this.getNestedTranslation(key);
        if (translation) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
          } else {
            el.textContent = translation;
          }
        }
      });

      // Update HTML lang attribute
      document.documentElement.lang = this.currentLang;
    },

    getNestedTranslation(key) {
      return key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
    }
  };

  // ========================================================================
  // MOBILE NAVIGATION
  // ========================================================================

  const MobileNav = {
    init() {
      this.menuToggle = document.querySelector('.header__menu-toggle');
      this.mobileNav = document.querySelector('.mobile-nav');
      this.mobileLinks = document.querySelectorAll('.mobile-nav__link');

      if (this.menuToggle && this.mobileNav) {
        this.setupEventListeners();
      }
    },

    setupEventListeners() {
      this.menuToggle.addEventListener('click', () => this.toggle());

      this.mobileLinks.forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });

      // Close on resize to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && this.isOpen()) {
          this.close();
        }
      });
    },

    toggle() {
      this.menuToggle.classList.toggle('active');
      this.mobileNav.classList.toggle('active');
      document.body.style.overflow = this.isOpen() ? 'hidden' : '';
    },

    close() {
      this.menuToggle.classList.remove('active');
      this.mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    },

    isOpen() {
      return this.mobileNav.classList.contains('active');
    }
  };

  // ========================================================================
  // SMOOTH SCROLL
  // ========================================================================

  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;

          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  // ========================================================================
  // SCROLL ANIMATIONS
  // ========================================================================

  const ScrollAnimations = {
    init() {
      this.animatedElements = document.querySelectorAll('[data-animate]');

      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              this.observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });

        this.animatedElements.forEach(el => this.observer.observe(el));
      } else {
        // Fallback for browsers without IntersectionObserver
        this.animatedElements.forEach(el => el.classList.add('visible'));
      }
    }
  };

  // ========================================================================
  // HEADER SCROLL EFFECT
  // ========================================================================

  const HeaderScroll = {
    init() {
      this.header = document.querySelector('.header');
      this.lastScroll = 0;

      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },

    onScroll() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        this.header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      } else {
        this.header.style.boxShadow = 'none';
      }

      this.lastScroll = currentScroll;
    }
  };

  // ========================================================================
  // FORM HANDLING
  // ========================================================================

  const ContactForm = {
    init() {
      this.form = document.querySelector('.contact__form');

      if (this.form) {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      }
    },

    handleSubmit(e) {
      e.preventDefault();

      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Here you would typically send the data to a server
      console.log('Form submitted:', data);

      // Show success message (in a real app, this would be after successful submission)
      this.showMessage('success');
      this.form.reset();
    },

    showMessage(type) {
      const messages = {
        success: {
          es: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.',
          en: 'Message sent successfully. We will contact you soon.'
        },
        error: {
          es: 'Error al enviar el mensaje. Por favor, intente nuevamente.',
          en: 'Error sending message. Please try again.'
        }
      };

      const lang = LanguageManager.currentLang;
      alert(messages[type][lang]);
    }
  };

  // ========================================================================
  // RETRO CURSOR EFFECT (Optional Enhancement)
  // ========================================================================

  const RetroCursor = {
    init() {
      // Only on non-touch devices
      if ('ontouchstart' in window) return;

      this.buttons = document.querySelectorAll('.btn, .card, .pricing-card');

      this.buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.cursor = 'pointer';
        });
      });
    }
  };

  // ========================================================================
  // INITIALIZE
  // ========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
    MobileNav.init();
    SmoothScroll.init();
    ScrollAnimations.init();
    HeaderScroll.init();
    ContactForm.init();
    RetroCursor.init();
  });

})();
