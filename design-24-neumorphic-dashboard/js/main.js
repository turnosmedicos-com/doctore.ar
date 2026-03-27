/**
 * DOCTORE.AR - Design 24: Neumorphic Dashboard
 * Main JavaScript
 */

(function() {
    'use strict';

    // ==============================================
    // LANGUAGE SYSTEM
    // ==============================================

    const LanguageManager = {
        currentLang: 'es',
        translations: {},

        async init() {
            this.currentLang = localStorage.getItem('doctore-lang') || 'es';
            await this.loadTranslations();
            this.updateContent();
            this.setupSwitcher();
        },

        async loadTranslations() {
            try {
                const [esResponse, enResponse] = await Promise.all([
                    fetch('lang/es.json'),
                    fetch('lang/en.json')
                ]);

                this.translations = {
                    es: await esResponse.json(),
                    en: await enResponse.json()
                };
            } catch (error) {
                console.error('Error loading translations:', error);
            }
        },

        updateContent() {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.getTranslation(key);
                if (translation) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = translation;
                    } else {
                        element.innerHTML = translation;
                    }
                }
            });

            // Update lang attribute
            document.documentElement.lang = this.currentLang;

            // Update active button
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
            });
        },

        getTranslation(key) {
            const keys = key.split('.');
            let value = this.translations[this.currentLang];

            for (const k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    return null;
                }
            }

            return value;
        },

        setLanguage(lang) {
            this.currentLang = lang;
            localStorage.setItem('doctore-lang', lang);
            this.updateContent();
        },

        setupSwitcher() {
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.setLanguage(btn.dataset.lang);
                });
            });
        }
    };

    // ==============================================
    // HEADER SCROLL EFFECT
    // ==============================================

    const HeaderManager = {
        header: null,
        scrollThreshold: 50,

        init() {
            this.header = document.querySelector('.header');
            if (!this.header) return;

            this.handleScroll();
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        },

        handleScroll() {
            const scrollY = window.scrollY;
            this.header.classList.toggle('scrolled', scrollY > this.scrollThreshold);
        }
    };

    // ==============================================
    // MOBILE NAVIGATION
    // ==============================================

    const MobileNavManager = {
        toggle: null,
        nav: null,

        init() {
            this.toggle = document.querySelector('.nav-mobile-toggle');
            this.nav = document.querySelector('.nav-mobile');

            if (!this.toggle || !this.nav) return;

            this.toggle.addEventListener('click', () => this.toggleNav());

            // Close on link click
            this.nav.querySelectorAll('.nav-mobile-link').forEach(link => {
                link.addEventListener('click', () => this.closeNav());
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!this.toggle.contains(e.target) && !this.nav.contains(e.target)) {
                    this.closeNav();
                }
            });
        },

        toggleNav() {
            this.toggle.classList.toggle('active');
            this.nav.classList.toggle('active');
        },

        closeNav() {
            this.toggle.classList.remove('active');
            this.nav.classList.remove('active');
        }
    };

    // ==============================================
    // SMOOTH SCROLL
    // ==============================================

    const SmoothScrollManager = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');

                    if (targetId === '#') return;

                    const target = document.querySelector(targetId);
                    if (target) {
                        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
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

    // ==============================================
    // REVEAL ON SCROLL
    // ==============================================

    const RevealManager = {
        init() {
            const revealElements = document.querySelectorAll('.reveal');

            if (!revealElements.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            revealElements.forEach(el => observer.observe(el));
        }
    };

    // ==============================================
    // CONTACT FORM
    // ==============================================

    const ContactFormManager = {
        form: null,

        init() {
            this.form = document.querySelector('.contact-form');
            if (!this.form) return;

            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },

        handleSubmit(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            // Validate
            if (!this.validate(data)) return;

            // Show success feedback (in production, this would send to server)
            this.showSuccess();
        },

        validate(data) {
            const requiredFields = ['name', 'email', 'message'];

            for (const field of requiredFields) {
                if (!data[field] || data[field].trim() === '') {
                    this.showError(`Por favor, complete el campo ${field}`);
                    return false;
                }
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showError('Por favor, ingrese un email válido');
                return false;
            }

            return true;
        },

        showSuccess() {
            const submitBtn = this.form.querySelector('.form-submit .btn');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Enviado';
            submitBtn.disabled = true;

            this.form.reset();

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        },

        showError(message) {
            // Simple error display - in production would be more sophisticated
            alert(message);
        }
    };

    // ==============================================
    // DASHBOARD ANIMATION
    // ==============================================

    const DashboardAnimator = {
        init() {
            this.animateCounters();
        },

        animateCounters() {
            const counters = document.querySelectorAll('[data-counter]');

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
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(start + (target - start) * easeOutQuart);

                element.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target.toLocaleString();
                }
            };

            requestAnimationFrame(updateCounter);
        }
    };

    // ==============================================
    // NEUMORPHIC BUTTON EFFECTS
    // ==============================================

    const NeumorphicEffects = {
        init() {
            this.setupButtonEffects();
        },

        setupButtonEffects() {
            document.querySelectorAll('.btn, .btn-icon').forEach(btn => {
                btn.addEventListener('mousedown', () => {
                    btn.style.transform = 'scale(0.98)';
                });

                btn.addEventListener('mouseup', () => {
                    btn.style.transform = '';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }
    };

    // ==============================================
    // MINI CALENDAR
    // ==============================================

    const MiniCalendar = {
        init() {
            this.generateCalendar();
        },

        generateCalendar() {
            const calendarContainer = document.querySelector('.mini-calendar');
            if (!calendarContainer) return;

            const today = new Date();
            const currentDay = today.getDate();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

            // Day names - will be updated by language manager
            const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

            // Clear existing content
            calendarContainer.innerHTML = '';

            // Add day names
            dayNames.forEach(day => {
                const dayNameEl = document.createElement('div');
                dayNameEl.className = 'calendar-day-name';
                dayNameEl.textContent = day;
                calendarContainer.appendChild(dayNameEl);
            });

            // Add empty cells for days before first day of month
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'calendar-day';
                emptyEl.style.visibility = 'hidden';
                calendarContainer.appendChild(emptyEl);
            }

            // Appointments (sample data)
            const appointments = [5, 8, 12, 15, 19, 22, 26];

            // Add days
            for (let day = 1; day <= Math.min(28, daysInMonth); day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;

                if (day === currentDay) {
                    dayEl.classList.add('today');
                }

                if (appointments.includes(day)) {
                    dayEl.classList.add('has-appointment');
                }

                calendarContainer.appendChild(dayEl);
            }
        }
    };

    // ==============================================
    // INITIALIZATION
    // ==============================================

    document.addEventListener('DOMContentLoaded', () => {
        LanguageManager.init();
        HeaderManager.init();
        MobileNavManager.init();
        SmoothScrollManager.init();
        RevealManager.init();
        ContactFormManager.init();
        DashboardAnimator.init();
        NeumorphicEffects.init();
        MiniCalendar.init();
    });

})();
