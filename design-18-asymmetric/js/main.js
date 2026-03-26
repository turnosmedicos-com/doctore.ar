/**
 * DOCTORE.AR - Design 18: Asymmetric
 * Main JavaScript
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        defaultLang: 'es',
        supportedLangs: ['es', 'en'],
        storageKey: 'doctore_lang',
        navScrollThreshold: 50,
        revealThreshold: 0.1
    };

    // ============================================
    // STATE
    // ============================================
    let state = {
        currentLang: CONFIG.defaultLang,
        translations: {},
        isMenuOpen: false
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const DOM = {
        nav: document.querySelector('.nav'),
        navToggle: document.querySelector('.nav__toggle'),
        navMenu: document.querySelector('.nav__menu'),
        navLinks: document.querySelectorAll('.nav__link'),
        langButton: document.querySelector('.nav__lang'),
        langText: document.querySelector('.nav__lang-text'),
        translatableElements: document.querySelectorAll('[data-i18n]'),
        revealElements: document.querySelectorAll('.reveal')
    };

    // ============================================
    // LANGUAGE MANAGEMENT
    // ============================================
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang} translations`);
            }
            return await response.json();
        } catch (error) {
            console.error('Translation loading error:', error);
            return null;
        }
    }

    function getNestedTranslation(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    function applyTranslations() {
        const translations = state.translations;

        DOM.translatableElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getNestedTranslation(translations, key);

            if (translation) {
                if (element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                } else if (element.hasAttribute('data-i18n-aria')) {
                    element.setAttribute('aria-label', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = state.currentLang;

        // Update language button text
        if (DOM.langText) {
            DOM.langText.textContent = state.currentLang.toUpperCase();
        }
    }

    async function setLanguage(lang) {
        if (!CONFIG.supportedLangs.includes(lang)) {
            lang = CONFIG.defaultLang;
        }

        const translations = await loadTranslations(lang);
        if (translations) {
            state.currentLang = lang;
            state.translations = translations;
            localStorage.setItem(CONFIG.storageKey, lang);
            applyTranslations();
        }
    }

    function toggleLanguage() {
        const currentIndex = CONFIG.supportedLangs.indexOf(state.currentLang);
        const nextIndex = (currentIndex + 1) % CONFIG.supportedLangs.length;
        setLanguage(CONFIG.supportedLangs[nextIndex]);
    }

    function initLanguage() {
        const savedLang = localStorage.getItem(CONFIG.storageKey);
        const browserLang = navigator.language.split('-')[0];
        const initialLang = savedLang ||
            (CONFIG.supportedLangs.includes(browserLang) ? browserLang : CONFIG.defaultLang);

        setLanguage(initialLang);
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function handleNavScroll() {
        if (window.scrollY > CONFIG.navScrollThreshold) {
            DOM.nav.classList.add('nav--scrolled');
        } else {
            DOM.nav.classList.remove('nav--scrolled');
        }
    }

    function toggleMenu() {
        state.isMenuOpen = !state.isMenuOpen;
        DOM.navToggle.classList.toggle('is-open', state.isMenuOpen);
        DOM.navMenu.classList.toggle('is-open', state.isMenuOpen);
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    }

    function closeMenu() {
        state.isMenuOpen = false;
        DOM.navToggle.classList.remove('is-open');
        DOM.navMenu.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function handleNavLinkClick(event) {
        const href = event.currentTarget.getAttribute('href');

        if (href.startsWith('#')) {
            event.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                closeMenu();
                const navHeight = DOM.nav.offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navHeight = DOM.nav.offsetHeight;
        const scrollPosition = window.scrollY + navHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                DOM.navLinks.forEach(link => {
                    link.classList.remove('is-active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('is-active');
                    }
                });
            }
        });
    }

    // ============================================
    // SCROLL REVEAL
    // ============================================
    function initScrollReveal() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: CONFIG.revealThreshold
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    // ============================================
    // FORM HANDLING
    // ============================================
    function initContactForm() {
        const form = document.querySelector('.contact__form');

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                // Simulate form submission
                const submitButton = form.querySelector('.contact__form-submit');
                const originalText = submitButton.textContent;

                submitButton.disabled = true;
                submitButton.textContent = state.currentLang === 'es' ? 'Enviando...' : 'Sending...';

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Show success message
                submitButton.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
                submitButton.style.backgroundColor = 'var(--color-success)';

                // Reset form
                setTimeout(() => {
                    form.reset();
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    submitButton.style.backgroundColor = '';
                }, 2000);
            });
        }
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    function initFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.hero__shape, .turnosmedicos__floating-card');

        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.5}s`;
            element.classList.add('animate-float');
        });
    }

    // ============================================
    // COUNTER ANIMATION
    // ============================================
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeProgress);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString() + '+';
            }
        }

        requestAnimationFrame(update);
    }

    function initCounterAnimations() {
        const statNumbers = document.querySelectorAll('.about__stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-count'), 10);
                    if (target) {
                        animateCounter(entry.target, target);
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function initEventListeners() {
        // Navigation scroll
        window.addEventListener('scroll', () => {
            handleNavScroll();
            updateActiveNavLink();
        }, { passive: true });

        // Mobile menu toggle
        if (DOM.navToggle) {
            DOM.navToggle.addEventListener('click', toggleMenu);
        }

        // Navigation links
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Language toggle
        if (DOM.langButton) {
            DOM.langButton.addEventListener('click', toggleLanguage);
        }

        // Close menu on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && state.isMenuOpen) {
                closeMenu();
            }
        });

        // Close menu on resize (if desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && state.isMenuOpen) {
                closeMenu();
            }
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        initLanguage();
        initEventListeners();
        initScrollReveal();
        initContactForm();
        initFloatingAnimations();
        initCounterAnimations();
        handleNavScroll();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
