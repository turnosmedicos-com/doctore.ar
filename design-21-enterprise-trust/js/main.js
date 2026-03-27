/**
 * DOCTORE.AR - DESIGN 21: ENTERPRISE TRUST
 * Main JavaScript
 * Hybrid: Enterprise + Medical + Dashboard
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        animationThreshold: 0.1,
        scrollOffset: 100,
        mobileBreakpoint: 1024,
        defaultLang: 'es'
    };

    // ============================================
    // STATE
    // ============================================
    let currentLang = CONFIG.defaultLang;
    let translations = {};

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        navbar: document.querySelector('.navbar'),
        navbarToggle: document.getElementById('navbar-toggle'),
        navbarMobile: document.getElementById('navbar-mobile'),
        navLinks: document.querySelectorAll('.navbar__link, .navbar__mobile-link'),
        langSwitch: document.querySelector('[data-lang-switch]'),
        langCurrent: document.querySelector('[data-lang-current]'),
        animatedElements: document.querySelectorAll('[data-animate]'),
        contactForm: document.getElementById('contact-form')
    };

    // ============================================
    // NAVIGATION
    // ============================================
    const Navigation = {
        init() {
            this.bindEvents();
            this.handleScroll();
        },

        bindEvents() {
            // Toggle mobile menu
            if (elements.navbarToggle) {
                elements.navbarToggle.addEventListener('click', () => this.toggleMobile());
            }

            // Close mobile menu on link click
            elements.navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMobile());
            });

            // Handle scroll
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

            // Close mobile menu on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth >= CONFIG.mobileBreakpoint) {
                    this.closeMobile();
                }
            });
        },

        toggleMobile() {
            const isActive = elements.navbarToggle.classList.toggle('active');
            elements.navbarMobile.classList.toggle('active', isActive);
            elements.navbarToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        },

        closeMobile() {
            elements.navbarToggle.classList.remove('active');
            elements.navbarMobile.classList.remove('active');
            elements.navbarToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        },

        handleScroll() {
            const scrolled = window.scrollY > CONFIG.scrollOffset;
            elements.navbar.classList.toggle('navbar--scrolled', scrolled);
            this.updateActiveLink();
        },

        updateActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 150;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    elements.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    };

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const Animations = {
        observer: null,

        init() {
            if ('IntersectionObserver' in window) {
                this.createObserver();
                this.observeElements();
            } else {
                // Fallback for older browsers
                this.showAllElements();
            }
        },

        createObserver() {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: CONFIG.animationThreshold,
                    rootMargin: '0px 0px -50px 0px'
                }
            );
        },

        observeElements() {
            elements.animatedElements.forEach(el => {
                this.observer.observe(el);
            });
        },

        showAllElements() {
            elements.animatedElements.forEach(el => {
                el.classList.add('visible');
            });
        }
    };

    // ============================================
    // LANGUAGE SWITCHER
    // ============================================
    const LanguageSwitcher = {
        init() {
            this.loadTranslations();
            this.bindEvents();
        },

        bindEvents() {
            if (elements.langSwitch) {
                elements.langSwitch.addEventListener('click', () => this.toggleLanguage());
            }
        },

        async loadTranslations() {
            try {
                const savedLang = localStorage.getItem('doctore_lang') || CONFIG.defaultLang;
                currentLang = savedLang;

                const response = await fetch(`lang/${savedLang}.json`);
                if (response.ok) {
                    translations = await response.json();
                    this.applyTranslations();
                    this.updateLangIndicator();
                }
            } catch (error) {
                // Silently fail - use default HTML content
            }
        },

        toggleLanguage() {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('doctore_lang', currentLang);
            this.loadLanguage(currentLang);
        },

        async loadLanguage(lang) {
            try {
                const response = await fetch(`lang/${lang}.json`);
                if (response.ok) {
                    translations = await response.json();
                    this.applyTranslations();
                    this.updateLangIndicator();
                    document.documentElement.lang = lang;
                }
            } catch (error) {
                // Silently fail
            }
        },

        applyTranslations() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.getNestedValue(translations, key);

                if (translation) {
                    if (el.hasAttribute('data-i18n-placeholder')) {
                        el.placeholder = translation;
                    } else {
                        el.textContent = translation;
                    }
                }
            });

            // Update page title
            if (translations.meta && translations.meta.title) {
                document.title = translations.meta.title;
            }

            // Update meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && translations.meta && translations.meta.description) {
                metaDesc.content = translations.meta.description;
            }
        },

        getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : null;
            }, obj);
        },

        updateLangIndicator() {
            if (elements.langCurrent) {
                elements.langCurrent.textContent = currentLang.toUpperCase();
            }
        }
    };

    // ============================================
    // CONTACT FORM
    // ============================================
    const ContactForm = {
        init() {
            if (elements.contactForm) {
                this.bindEvents();
            }
        },

        bindEvents() {
            elements.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        },

        handleSubmit(e) {
            e.preventDefault();

            const formData = new FormData(elements.contactForm);
            const data = Object.fromEntries(formData.entries());

            // Show success message (in production, send to server)
            this.showSuccess();

            // Reset form
            elements.contactForm.reset();
        },

        showSuccess() {
            const button = elements.contactForm.querySelector('button[type="submit"]');
            const originalText = button.textContent;

            button.textContent = currentLang === 'es' ? 'Enviado!' : 'Sent!';
            button.disabled = true;

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
        }
    };

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
            });
        },

        handleClick(e, anchor) {
            const href = anchor.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const navHeight = elements.navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    // ============================================
    // COUNTER ANIMATION
    // ============================================
    const CounterAnimation = {
        init() {
            const counters = document.querySelectorAll('[data-counter]');

            if (counters.length === 0) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateCounter(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            counters.forEach(counter => observer.observe(counter));
        },

        animateCounter(element) {
            const target = element.getAttribute('data-counter');
            const suffix = element.getAttribute('data-counter-suffix') || '';
            const numericValue = parseInt(target.replace(/[^\d]/g, ''));

            if (isNaN(numericValue)) {
                element.textContent = target;
                return;
            }

            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;
            let current = 0;
            const increment = numericValue / steps;

            const timer = setInterval(() => {
                current += increment;

                if (current >= numericValue) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    const displayValue = Math.floor(current);
                    element.textContent = this.formatNumber(displayValue) + suffix;
                }
            }, stepDuration);
        },

        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(0) + 'K';
            }
            return num.toString();
        }
    };

    // ============================================
    // PROGRESS BAR ANIMATION
    // ============================================
    const ProgressAnimation = {
        init() {
            const progressBars = document.querySelectorAll('.service-widget__progress-fill');

            if (progressBars.length === 0) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateProgress(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            progressBars.forEach(bar => {
                // Store original width and reset
                const width = bar.style.width;
                bar.setAttribute('data-width', width);
                bar.style.width = '0%';
                observer.observe(bar);
            });
        },

        animateProgress(element) {
            const targetWidth = element.getAttribute('data-width');

            setTimeout(() => {
                element.style.width = targetWidth;
            }, 100);
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        Navigation.init();
        Animations.init();
        LanguageSwitcher.init();
        ContactForm.init();
        SmoothScroll.init();
        CounterAnimation.init();
        ProgressAnimation.init();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
