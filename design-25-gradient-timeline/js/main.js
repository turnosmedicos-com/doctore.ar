/* ============================================
   DESIGN 25: GRADIENT TIMELINE
   Main JavaScript
   ============================================ */

(function() {
    'use strict';

    /* ===================
       CONFIGURATION
       =================== */
    const CONFIG = {
        defaultLang: 'es',
        scrollOffset: 80,
        animationThreshold: 0.2,
        debounceDelay: 100
    };

    /* ===================
       STATE
       =================== */
    const state = {
        currentLang: CONFIG.defaultLang,
        translations: {},
        isMenuOpen: false,
        isScrolled: false
    };

    /* ===================
       DOM ELEMENTS
       =================== */
    const elements = {
        nav: document.querySelector('.nav'),
        navLinks: document.querySelector('.nav__links'),
        mobileToggle: document.querySelector('.nav__mobile-toggle'),
        langToggle: document.querySelector('.nav__lang-toggle'),
        langText: document.querySelector('.nav__lang-text'),
        animatedElements: document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .timeline__item, .turnos__feature')
    };

    /* ===================
       UTILITIES
       =================== */
    const utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        },

        isInViewport(element, threshold = 0) {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            return rect.top <= windowHeight * (1 - threshold);
        }
    };

    /* ===================
       LANGUAGE SYSTEM
       =================== */
    const languageSystem = {
        async init() {
            const savedLang = localStorage.getItem('doctore-lang') || CONFIG.defaultLang;
            await this.loadTranslations(savedLang);
            this.setupEventListeners();
        },

        async loadTranslations(lang) {
            try {
                const response = await fetch(`lang/${lang}.json`);
                if (!response.ok) throw new Error('Translation file not found');
                state.translations = await response.json();
                state.currentLang = lang;
                localStorage.setItem('doctore-lang', lang);
                this.applyTranslations();
                this.updateLangToggle();
            } catch (error) {
                console.error('Error loading translations:', error);
                if (lang !== CONFIG.defaultLang) {
                    await this.loadTranslations(CONFIG.defaultLang);
                }
            }
        },

        applyTranslations() {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.getNestedTranslation(key);
                if (translation) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            });

            // Update HTML lang attribute
            document.documentElement.lang = state.currentLang;
        },

        getNestedTranslation(key) {
            return key.split('.').reduce((obj, k) => obj && obj[k], state.translations);
        },

        updateLangToggle() {
            if (elements.langText) {
                elements.langText.textContent = state.currentLang.toUpperCase();
            }
        },

        toggleLanguage() {
            const newLang = state.currentLang === 'es' ? 'en' : 'es';
            this.loadTranslations(newLang);
        },

        setupEventListeners() {
            if (elements.langToggle) {
                elements.langToggle.addEventListener('click', () => this.toggleLanguage());
            }
        }
    };

    /* ===================
       NAVIGATION
       =================== */
    const navigation = {
        init() {
            this.handleScroll();
            this.setupEventListeners();
        },

        handleScroll() {
            const scrollY = window.scrollY;

            if (scrollY > 50 && !state.isScrolled) {
                state.isScrolled = true;
                elements.nav?.classList.add('scrolled');
            } else if (scrollY <= 50 && state.isScrolled) {
                state.isScrolled = false;
                elements.nav?.classList.remove('scrolled');
            }
        },

        toggleMobileMenu() {
            state.isMenuOpen = !state.isMenuOpen;
            elements.mobileToggle?.classList.toggle('active', state.isMenuOpen);
            elements.navLinks?.classList.toggle('active', state.isMenuOpen);
            document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
        },

        closeMobileMenu() {
            state.isMenuOpen = false;
            elements.mobileToggle?.classList.remove('active');
            elements.navLinks?.classList.remove('active');
            document.body.style.overflow = '';
        },

        smoothScroll(targetId) {
            const target = document.querySelector(targetId);
            if (target) {
                const offsetTop = target.offsetTop - CONFIG.scrollOffset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        },

        setupEventListeners() {
            // Scroll handler
            window.addEventListener('scroll', utils.debounce(() => {
                this.handleScroll();
            }, CONFIG.debounceDelay));

            // Mobile toggle
            elements.mobileToggle?.addEventListener('click', () => this.toggleMobileMenu());

            // Navigation links
            document.querySelectorAll('.nav__link').forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        this.closeMobileMenu();
                        this.smoothScroll(href);
                    }
                });
            });

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (state.isMenuOpen &&
                    !elements.navLinks?.contains(e.target) &&
                    !elements.mobileToggle?.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    };

    /* ===================
       SCROLL ANIMATIONS
       =================== */
    const scrollAnimations = {
        init() {
            this.setupIntersectionObserver();
        },

        setupIntersectionObserver() {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: CONFIG.animationThreshold
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            elements.animatedElements.forEach(el => observer.observe(el));
        }
    };

    /* ===================
       FORM HANDLING
       =================== */
    const formHandler = {
        init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            const form = document.querySelector('.contact__form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleSubmit(e));
            }
        },

        handleSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Simulate form submission
            console.log('Form submitted:', data);

            // Show success message
            this.showSuccessMessage(form);

            // Reset form
            form.reset();
        },

        showSuccessMessage(form) {
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success';
            successMessage.style.cssText = `
                background: var(--gradient-primary);
                color: white;
                padding: var(--space-lg);
                border-radius: var(--radius-lg);
                margin-top: var(--space-lg);
                text-align: center;
                font-weight: 500;
            `;
            successMessage.textContent = state.translations.contact?.success || 'Message sent successfully!';

            form.appendChild(successMessage);

            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        }
    };

    /* ===================
       CALENDAR DEMO
       =================== */
    const calendarDemo = {
        init() {
            this.setupInteractivity();
        },

        setupInteractivity() {
            const days = document.querySelectorAll('.turnos__demo-day--available');
            const times = document.querySelectorAll('.turnos__demo-time');

            days.forEach(day => {
                day.addEventListener('click', () => {
                    days.forEach(d => d.classList.remove('turnos__demo-day--selected'));
                    day.classList.add('turnos__demo-day--selected');
                });
            });

            times.forEach(time => {
                time.addEventListener('click', () => {
                    times.forEach(t => t.classList.remove('turnos__demo-time--selected'));
                    time.classList.add('turnos__demo-time--selected');
                });
            });
        }
    };

    /* ===================
       GRADIENT ANIMATION
       =================== */
    const gradientAnimation = {
        init() {
            this.animateGradientText();
        },

        animateGradientText() {
            const gradientTexts = document.querySelectorAll('.text-gradient');
            gradientTexts.forEach(text => {
                text.style.backgroundSize = '200% 200%';
                text.style.animation = 'gradientText 5s ease infinite';
            });

            // Add keyframes if not present
            if (!document.querySelector('#gradient-text-keyframes')) {
                const style = document.createElement('style');
                style.id = 'gradient-text-keyframes';
                style.textContent = `
                    @keyframes gradientText {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    /* ===================
       PARALLAX EFFECTS
       =================== */
    const parallaxEffects = {
        init() {
            if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                this.setupParallax();
            }
        },

        setupParallax() {
            const shapes = document.querySelectorAll('.hero__shape');

            window.addEventListener('scroll', utils.debounce(() => {
                const scrollY = window.scrollY;

                shapes.forEach((shape, index) => {
                    const speed = 0.05 + (index * 0.02);
                    shape.style.transform = `translateY(${scrollY * speed}px)`;
                });
            }, 10));
        }
    };

    /* ===================
       INITIALIZATION
       =================== */
    function init() {
        // Initialize all modules
        languageSystem.init();
        navigation.init();
        scrollAnimations.init();
        formHandler.init();
        calendarDemo.init();
        gradientAnimation.init();
        parallaxEffects.init();

        // Add loaded class to body
        document.body.classList.add('loaded');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
