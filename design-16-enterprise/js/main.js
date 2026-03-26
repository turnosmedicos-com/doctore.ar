/**
 * DOCTORE.AR - ENTERPRISE DESIGN
 * Main JavaScript File
 * =============================================
 */

(function() {
    'use strict';

    // =========================================
    // LANGUAGE MANAGEMENT
    // =========================================

    const LanguageManager = {
        currentLang: 'es',
        translations: {},

        async init() {
            // Get saved language or default to Spanish
            this.currentLang = localStorage.getItem('doctore_lang') || 'es';
            await this.loadTranslations(this.currentLang);
            this.updateContent();
            this.updateLangSwitcher();
            this.bindEvents();
        },

        async loadTranslations(lang) {
            try {
                const response = await fetch(`lang/${lang}.json`);
                if (!response.ok) throw new Error('Language file not found');
                this.translations = await response.json();
            } catch (error) {
                console.error('Error loading translations:', error);
                // Fallback to Spanish
                if (lang !== 'es') {
                    await this.loadTranslations('es');
                }
            }
        },

        async switchLanguage(lang) {
            if (lang === this.currentLang) return;

            this.currentLang = lang;
            localStorage.setItem('doctore_lang', lang);
            await this.loadTranslations(lang);
            this.updateContent();
            this.updateLangSwitcher();

            // Update HTML lang attribute
            document.documentElement.lang = lang;
        },

        updateLangSwitcher() {
            const langText = document.querySelector('[data-lang-current]');
            if (langText) {
                langText.textContent = this.currentLang.toUpperCase();
            }
        },

        updateContent() {
            const t = this.translations;

            // Update page title and meta
            if (t.meta) {
                document.title = t.meta.title;
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.content = t.meta.description;
            }

            // Update all elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const value = this.getNestedValue(t, key);
                if (value !== undefined) {
                    el.textContent = value;
                }
            });

            // Update all elements with data-i18n-placeholder attribute
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const value = this.getNestedValue(t, key);
                if (value !== undefined) {
                    el.placeholder = value;
                }
            });

            // Update select options
            this.updateSelectOptions();
        },

        updateSelectOptions() {
            const t = this.translations;
            const employeesSelect = document.getElementById('employees');

            if (employeesSelect && t.contact?.form?.employeesOptions) {
                const options = t.contact.form.employeesOptions;
                employeesSelect.innerHTML = options.map((opt, i) =>
                    `<option value="${i === 0 ? '' : opt}"${i === 0 ? ' disabled selected' : ''}>${opt}</option>`
                ).join('');
            }
        },

        getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) =>
                current && current[key] !== undefined ? current[key] : undefined, obj);
        },

        bindEvents() {
            const langSwitcher = document.querySelector('[data-lang-switch]');
            if (langSwitcher) {
                langSwitcher.addEventListener('click', () => {
                    const newLang = this.currentLang === 'es' ? 'en' : 'es';
                    this.switchLanguage(newLang);
                });
            }
        }
    };

    // =========================================
    // NAVIGATION
    // =========================================

    const Navigation = {
        navbar: null,
        toggle: null,
        menu: null,
        lastScrollY: 0,

        init() {
            this.navbar = document.querySelector('.navbar');
            this.toggle = document.querySelector('.navbar__toggle');
            this.menu = document.querySelector('.navbar__menu');

            if (!this.navbar) return;

            this.bindEvents();
            this.handleScroll();
        },

        bindEvents() {
            // Mobile menu toggle
            if (this.toggle) {
                this.toggle.addEventListener('click', () => this.toggleMenu());
            }

            // Close menu on link click
            if (this.menu) {
                this.menu.querySelectorAll('.navbar__link').forEach(link => {
                    link.addEventListener('click', () => this.closeMenu());
                });
            }

            // Scroll event for navbar styling
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

            // Close menu on resize to desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 1024) {
                    this.closeMenu();
                }
            });

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (this.menu?.classList.contains('active') &&
                    !this.menu.contains(e.target) &&
                    !this.toggle?.contains(e.target)) {
                    this.closeMenu();
                }
            });
        },

        toggleMenu() {
            this.toggle?.classList.toggle('active');
            this.menu?.classList.toggle('active');
            document.body.style.overflow = this.menu?.classList.contains('active') ? 'hidden' : '';
        },

        closeMenu() {
            this.toggle?.classList.remove('active');
            this.menu?.classList.remove('active');
            document.body.style.overflow = '';
        },

        handleScroll() {
            const scrollY = window.scrollY;

            // Add scrolled class when page is scrolled
            if (scrollY > 50) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }

            this.lastScrollY = scrollY;
        }
    };

    // =========================================
    // SMOOTH SCROLL
    // =========================================

    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;

                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
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

    // =========================================
    // SCROLL ANIMATIONS
    // =========================================

    const ScrollAnimations = {
        observer: null,

        init() {
            // Check for reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // Show all elements immediately
                document.querySelectorAll('[data-animate]').forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
                return;
            }

            this.createObserver();
            this.observeElements();
        },

        createObserver() {
            const options = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const delay = el.getAttribute('data-animate-delay') || 0;

                        setTimeout(() => {
                            el.classList.add('animate-fade-in-up');
                            el.style.opacity = '1';
                        }, delay * 100);

                        this.observer.unobserve(el);
                    }
                });
            }, options);
        },

        observeElements() {
            document.querySelectorAll('[data-animate]').forEach(el => {
                el.style.opacity = '0';
                this.observer.observe(el);
            });
        }
    };

    // =========================================
    // FORM HANDLING
    // =========================================

    const FormHandler = {
        form: null,

        init() {
            this.form = document.querySelector('.contact__form');
            if (!this.form) return;

            this.bindEvents();
        },

        bindEvents() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Real-time validation
            this.form.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearError(field));
            });
        },

        handleSubmit(e) {
            e.preventDefault();

            const isValid = this.validateForm();
            if (!isValid) return;

            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                <span>Enviando...</span>
            `;

            // Simulate form submission
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                // Show success message
                this.showNotification('success', 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
                this.form.reset();
            }, 2000);
        },

        validateForm() {
            let isValid = true;
            const requiredFields = this.form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        },

        validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            // Check required
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'Este campo es requerido';
            }

            // Check email format
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingrese un email válido';
                }
            }

            // Check phone format
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingrese un teléfono válido';
                }
            }

            if (!isValid) {
                this.showError(field, errorMessage);
            } else {
                this.clearError(field);
            }

            return isValid;
        },

        showError(field, message) {
            this.clearError(field);

            field.style.borderColor = 'var(--color-error)';

            const errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.textContent = message;
            errorEl.style.cssText = `
                display: block;
                color: var(--color-error);
                font-size: var(--text-sm);
                margin-top: var(--space-1);
            `;

            field.parentNode.appendChild(errorEl);
        },

        clearError(field) {
            field.style.borderColor = '';
            const existingError = field.parentNode.querySelector('.form-error');
            if (existingError) {
                existingError.remove();
            }
        },

        showNotification(type, message) {
            // Remove existing notifications
            document.querySelectorAll('.notification').forEach(n => n.remove());

            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.style.cssText = `
                position: fixed;
                bottom: var(--space-6);
                right: var(--space-6);
                padding: var(--space-4) var(--space-6);
                background-color: ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
                color: var(--color-white);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: var(--z-tooltip);
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            `;
            notification.textContent = message;

            document.body.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
    };

    // =========================================
    // COUNTER ANIMATION
    // =========================================

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
            const target = element.getAttribute('data-counter');
            const suffix = element.getAttribute('data-counter-suffix') || '';
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            // Extract numeric value
            const numericTarget = parseFloat(target.replace(/[^\d.]/g, ''));
            const prefix = target.replace(/[\d.]+.*/, '');

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(easeOutQuart * numericTarget);

                element.textContent = prefix + current.toLocaleString() + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = target + suffix;
                }
            };

            requestAnimationFrame(animate);
        }
    };

    // =========================================
    // ACTIVE NAVIGATION LINK
    // =========================================

    const ActiveNavLink = {
        init() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');

            if (!sections.length || !navLinks.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, {
                rootMargin: '-50% 0px -50% 0px'
            });

            sections.forEach(section => observer.observe(section));
        }
    };

    // =========================================
    // INITIALIZATION
    // =========================================

    const App = {
        async init() {
            // Initialize all modules
            await LanguageManager.init();
            Navigation.init();
            SmoothScroll.init();
            ScrollAnimations.init();
            FormHandler.init();
            CounterAnimation.init();
            ActiveNavLink.init();

            // Add loaded class to body
            document.body.classList.add('loaded');
        }
    };

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

    // Add CSS keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);

})();
