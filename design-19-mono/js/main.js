/**
 * Design 19 - Monochrome with Accent
 * Main JavaScript
 */

(function() {
    'use strict';

    // ==========================================================================
    // LANGUAGE MANAGEMENT
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
                this.updateLangButtons();
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
                const translation = this.getNestedTranslation(key);
                if (translation) {
                    element.textContent = translation;
                }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const translation = this.getNestedTranslation(key);
                if (translation) {
                    element.placeholder = translation;
                }
            });

            document.querySelectorAll('[data-i18n-html]').forEach(element => {
                const key = element.getAttribute('data-i18n-html');
                const translation = this.getNestedTranslation(key);
                if (translation) {
                    element.innerHTML = translation;
                }
            });

            document.documentElement.lang = this.currentLang;
        },

        getNestedTranslation(key) {
            return key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
        },

        updateLangButtons() {
            document.querySelectorAll('.nav__lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
            });
        },

        bindEvents() {
            document.querySelectorAll('.nav__lang-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = btn.getAttribute('data-lang');
                    if (lang !== this.currentLang) {
                        this.loadLanguage(lang);
                    }
                });
            });
        }
    };

    // ==========================================================================
    // NAVIGATION
    // ==========================================================================

    const Navigation = {
        nav: null,
        toggle: null,
        menu: null,
        links: null,

        init() {
            this.nav = document.querySelector('.nav');
            this.toggle = document.querySelector('.nav__toggle');
            this.menu = document.querySelector('.nav__menu');
            this.links = document.querySelectorAll('.nav__link');

            if (!this.nav) return;

            this.bindEvents();
            this.handleScroll();
        },

        bindEvents() {
            // Toggle mobile menu
            if (this.toggle) {
                this.toggle.addEventListener('click', () => this.toggleMenu());
            }

            // Close menu on link click
            this.links.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Handle scroll
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

            // Close menu on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.menu.classList.contains('active')) {
                    this.closeMenu();
                }
            });

            // Close menu on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 1024 && this.menu.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        },

        toggleMenu() {
            this.menu.classList.toggle('active');
            this.toggle.classList.toggle('active');
            document.body.style.overflow = this.menu.classList.contains('active') ? 'hidden' : '';
        },

        closeMenu() {
            this.menu.classList.remove('active');
            this.toggle.classList.remove('active');
            document.body.style.overflow = '';
        },

        handleScroll() {
            const scrolled = window.scrollY > 50;
            this.nav.classList.toggle('nav--scrolled', scrolled);
        }
    };

    // ==========================================================================
    // SMOOTH SCROLL
    // ==========================================================================

    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;

                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
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

    // ==========================================================================
    // SCROLL ANIMATIONS
    // ==========================================================================

    const ScrollAnimations = {
        observer: null,

        init() {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');

                        // Handle stagger animations
                        if (entry.target.classList.contains('stagger-container')) {
                            const items = entry.target.querySelectorAll('.stagger-item');
                            items.forEach((item, index) => {
                                setTimeout(() => {
                                    item.classList.add('visible');
                                }, index * 100);
                            });
                        }
                    }
                });
            }, options);

            // Observe fade-in elements
            document.querySelectorAll('.fade-in').forEach(el => {
                this.observer.observe(el);
            });

            // Observe stagger containers
            document.querySelectorAll('.stagger-container').forEach(el => {
                this.observer.observe(el);
            });
        }
    };

    // ==========================================================================
    // SCROLL TO TOP
    // ==========================================================================

    const ScrollToTop = {
        button: null,

        init() {
            this.button = document.querySelector('.scroll-top');
            if (!this.button) return;

            window.addEventListener('scroll', () => this.toggleVisibility(), { passive: true });
            this.button.addEventListener('click', () => this.scrollToTop());
        },

        toggleVisibility() {
            const scrolled = window.scrollY > 500;
            this.button.classList.toggle('visible', scrolled);
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // ==========================================================================
    // FORM HANDLING
    // ==========================================================================

    const FormHandler = {
        init() {
            const form = document.querySelector('.contact__form');
            if (!form) return;

            form.addEventListener('submit', (e) => this.handleSubmit(e));
        },

        handleSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = '...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                form.reset();

                // Show success message (you can customize this)
                alert(LanguageManager.currentLang === 'es'
                    ? 'Mensaje enviado correctamente'
                    : 'Message sent successfully');
            }, 1500);
        }
    };

    // ==========================================================================
    // STATS COUNTER
    // ==========================================================================

    const StatsCounter = {
        init() {
            const stats = document.querySelectorAll('.hero__stat-value');
            if (!stats.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateValue(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            stats.forEach(stat => observer.observe(stat));
        },

        animateValue(element) {
            const text = element.textContent;
            const match = text.match(/(\d+)/);
            if (!match) return;

            const target = parseInt(match[1]);
            const suffix = text.replace(match[1], '');
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.innerHTML = Math.floor(current) + suffix;
            }, 16);
        }
    };

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    document.addEventListener('DOMContentLoaded', async () => {
        await LanguageManager.init();
        Navigation.init();
        SmoothScroll.init();
        ScrollAnimations.init();
        ScrollToTop.init();
        FormHandler.init();
        StatsCounter.init();
    });

})();
