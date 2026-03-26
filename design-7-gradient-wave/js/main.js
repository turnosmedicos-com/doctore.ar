/**
 * DESIGN 7 - GRADIENT WAVE
 * Main JavaScript - Fluid, Dynamic, Organic Design
 */

(function() {
  'use strict';

  /* ==========================================================================
     Configuration
     ========================================================================== */
  const CONFIG = {
    defaultLang: 'es',
    storageKey: 'doctore_lang',
    animationThreshold: 0.1,
    headerScrollThreshold: 50
  };

  /* ==========================================================================
     State
     ========================================================================== */
  let state = {
    currentLang: CONFIG.defaultLang,
    translations: {},
    isMenuOpen: false,
    isScrolled: false
  };

  /* ==========================================================================
     DOM Elements
     ========================================================================== */
  const elements = {
    html: document.documentElement,
    header: document.querySelector('.header'),
    menuToggle: document.querySelector('.header__menu-toggle'),
    mobileMenu: document.querySelector('.mobile-menu'),
    langToggle: document.querySelector('.header__lang-toggle'),
    langToggleMobile: document.querySelector('.mobile-menu__lang-toggle'),
    translatableElements: document.querySelectorAll('[data-i18n]'),
    translatableAttrs: document.querySelectorAll('[data-i18n-attr]'),
    animatedElements: document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .stagger-children')
  };

  /* ==========================================================================
     Language Management
     ========================================================================== */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error('Translation file not found');
      return await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      return null;
    }
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  function applyTranslations() {
    // Update text content
    elements.translatableElements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(state.translations, key);
      if (value) {
        element.textContent = value;
      }
    });

    // Update attributes (placeholder, title, aria-label, etc.)
    elements.translatableAttrs.forEach(element => {
      const data = element.getAttribute('data-i18n-attr');
      const pairs = data.split(';');

      pairs.forEach(pair => {
        const [attr, key] = pair.split(':');
        const value = getNestedValue(state.translations, key);
        if (value && attr) {
          element.setAttribute(attr.trim(), value);
        }
      });
    });

    // Update HTML lang attribute
    elements.html.setAttribute('lang', state.currentLang);

    // Update meta tags
    const metaTitle = getNestedValue(state.translations, 'meta.title');
    const metaDescription = getNestedValue(state.translations, 'meta.description');

    if (metaTitle) {
      document.title = metaTitle;
    }

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && metaDescription) {
      descMeta.setAttribute('content', metaDescription);
    }

    // Update language toggle button text
    if (elements.langToggle) {
      elements.langToggle.textContent = state.currentLang === 'es' ? 'EN' : 'ES';
    }
    if (elements.langToggleMobile) {
      elements.langToggleMobile.textContent = state.currentLang === 'es' ? 'EN' : 'ES';
    }
  }

  async function setLanguage(lang) {
    const translations = await loadTranslations(lang);
    if (translations) {
      state.currentLang = lang;
      state.translations = translations;
      localStorage.setItem(CONFIG.storageKey, lang);
      applyTranslations();
    }
  }

  function toggleLanguage() {
    const newLang = state.currentLang === 'es' ? 'en' : 'es';
    setLanguage(newLang);
  }

  function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);
    const browserLang = navigator.language.slice(0, 2);
    const initialLang = savedLang || (browserLang === 'en' ? 'en' : CONFIG.defaultLang);
    setLanguage(initialLang);
  }

  /* ==========================================================================
     Mobile Menu
     ========================================================================== */
  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;

    if (elements.menuToggle) {
      elements.menuToggle.classList.toggle('header__menu-toggle--active', state.isMenuOpen);
    }

    if (elements.mobileMenu) {
      elements.mobileMenu.classList.toggle('mobile-menu--open', state.isMenuOpen);
    }

    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (state.isMenuOpen) {
      toggleMobileMenu();
    }
  }

  /* ==========================================================================
     Header Scroll Effect
     ========================================================================== */
  function handleScroll() {
    const scrollY = window.scrollY;
    const shouldBeScrolled = scrollY > CONFIG.headerScrollThreshold;

    if (shouldBeScrolled !== state.isScrolled) {
      state.isScrolled = shouldBeScrolled;
      if (elements.header) {
        elements.header.classList.toggle('header--scrolled', state.isScrolled);
      }
    }
  }

  /* ==========================================================================
     Smooth Scroll
     ========================================================================== */
  function handleNavClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    event.preventDefault();

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = elements.header ? elements.header.offsetHeight : 0;
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      closeMobileMenu();
    }
  }

  /* ==========================================================================
     Scroll Animations
     ========================================================================== */
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    elements.animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  /* ==========================================================================
     Contact Form
     ========================================================================== */
  function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Here you would typically send the data to a server
    console.log('Form submitted:', data);

    // Show success message
    const submitBtn = form.querySelector('.contact__submit');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 3000);
  }

  /* ==========================================================================
     Wave Animation Enhancement
     ========================================================================== */
  function createWaveParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'hero__particles';
    particlesContainer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    `;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 4 + 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 4}s;
      `;
      particlesContainer.appendChild(particle);
    }

    hero.insertBefore(particlesContainer, hero.firstChild);
  }

  /* ==========================================================================
     Gradient Animation
     ========================================================================== */
  function initGradientAnimation() {
    const gradientElements = document.querySelectorAll('.btn--primary');

    gradientElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.backgroundSize = '200% 200%';
      });

      element.addEventListener('mouseleave', () => {
        element.style.backgroundSize = '100% 100%';
      });
    });
  }

  /* ==========================================================================
     Active Navigation
     ========================================================================== */
  function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header__nav-link, .mobile-menu__link');

    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('header__nav-link--active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('header__nav-link--active');
          }
        });
      }
    });
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */
  function initEventListeners() {
    // Language toggle
    if (elements.langToggle) {
      elements.langToggle.addEventListener('click', toggleLanguage);
    }
    if (elements.langToggleMobile) {
      elements.langToggleMobile.addEventListener('click', toggleLanguage);
    }

    // Mobile menu toggle
    if (elements.menuToggle) {
      elements.menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Navigation clicks
    document.addEventListener('click', handleNavClick);

    // Scroll events
    window.addEventListener('scroll', () => {
      handleScroll();
      updateActiveNavigation();
    }, { passive: true });

    // Contact form
    const contactForm = document.querySelector('.contact__form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Close mobile menu on escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });

    // Close mobile menu on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    });
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */
  function init() {
    initLanguage();
    initEventListeners();
    initScrollAnimations();
    initGradientAnimation();
    createWaveParticles();
    handleScroll();
    updateActiveNavigation();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
