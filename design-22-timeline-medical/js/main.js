/* ============================================
   DESIGN 22 - TIMELINE MEDICAL
   Main JavaScript
   Hybrid: Timeline + Medical + Gradient Wave
   ============================================ */

(function() {
    'use strict';

    // === CONFIGURATION ===
    const CONFIG = {
        defaultLang: 'es',
        scrollThreshold: 50,
        observerThreshold: 0.1,
        observerRootMargin: '0px 0px -50px 0px',
        timelineAnimationDelay: 100
    };

    // === STATE ===
    const state = {
        currentLang: CONFIG.defaultLang,
        translations: {},
        isMenuOpen: false,
        scrollProgress: 0
    };

    // === DOM ELEMENTS ===
    const elements = {
        header: null,
        mobileMenuBtn: null,
        mobileNav: null,
        langSwitcherBtns: null,
        timelineProgress: null,
        translatableElements: null
    };

    // === INITIALIZATION ===
    function init() {
        cacheElements();
        loadTranslations();
        setupEventListeners();
        setupScrollObserver();
        setupTimelineProgress();
        updateLanguage(state.currentLang);
    }

    function cacheElements() {
        elements.header = document.querySelector('.header');
        elements.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        elements.mobileNav = document.querySelector('.mobile-nav');
        elements.langSwitcherBtns = document.querySelectorAll('.lang-switcher__btn');
        elements.timelineProgress = document.querySelector('.timeline__progress');
        elements.translatableElements = document.querySelectorAll('[data-i18n]');
    }

    // === TRANSLATIONS ===
    async function loadTranslations() {
        try {
            const [esResponse, enResponse] = await Promise.all([
                fetch('./lang/es.json'),
                fetch('./lang/en.json')
            ]);

            state.translations.es = await esResponse.json();
            state.translations.en = await enResponse.json();

            // Check for saved language preference
            const savedLang = localStorage.getItem('doctore_lang');
            if (savedLang && state.translations[savedLang]) {
                state.currentLang = savedLang;
            }

            updateLanguage(state.currentLang);
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    function updateLanguage(lang) {
        if (!state.translations[lang]) return;

        state.currentLang = lang;
        localStorage.setItem('doctore_lang', lang);

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update all translatable elements
        elements.translatableElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getNestedTranslation(state.translations[lang], key);

            if (translation) {
                if (element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update language switcher active state
        elements.langSwitcherBtns.forEach(btn => {
            btn.classList.toggle('lang-switcher__btn--active', btn.dataset.lang === lang);
        });
    }

    function getNestedTranslation(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // === EVENT LISTENERS ===
    function setupEventListeners() {
        // Scroll event for header
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Mobile menu toggle
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Language switcher
        elements.langSwitcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                updateLanguage(btn.dataset.lang);
            });
        });

        // Close mobile menu on link click
        const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
        });

        // Form submission
        const contactForm = document.querySelector('.contact__form');
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }
    }

    function handleScroll() {
        const scrollY = window.scrollY;

        // Header scroll effect
        if (elements.header) {
            elements.header.classList.toggle('header--scrolled', scrollY > CONFIG.scrollThreshold);
        }

        // Update timeline progress
        updateTimelineProgress();
    }

    function toggleMobileMenu() {
        state.isMenuOpen = !state.isMenuOpen;
        elements.mobileMenuBtn.classList.toggle('mobile-menu-btn--open', state.isMenuOpen);
        elements.mobileNav.classList.toggle('mobile-nav--open', state.isMenuOpen);
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    }

    function closeMobileMenu() {
        state.isMenuOpen = false;
        elements.mobileMenuBtn.classList.remove('mobile-menu-btn--open');
        elements.mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
    }

    function handleAnchorClick(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = elements.header ? elements.header.offsetHeight : 0;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            closeMobileMenu();
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Here you would typically send the data to your backend
        console.log('Form submitted:', data);

        // Show success message (in real app, this would be after successful API call)
        const submitBtn = e.target.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = state.currentLang === 'es' ? 'Enviado!' : 'Sent!';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            e.target.reset();
        }, 2000);
    }

    // === SCROLL OBSERVER ===
    function setupScrollObserver() {
        const observerOptions = {
            threshold: CONFIG.observerThreshold,
            rootMargin: CONFIG.observerRootMargin
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add delay for staggered animations
                    setTimeout(() => {
                        entry.target.classList.add(getVisibleClass(entry.target));
                    }, index * CONFIG.timelineAnimationDelay);
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        const animatableSelectors = [
            '.timeline-item',
            '.turnos__step',
            '.service-item',
            '.pricing-card',
            '.about__content',
            '.about__visual',
            '.contact__info',
            '.contact__form-wrapper',
            '.animate-on-scroll'
        ];

        animatableSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                observer.observe(el);
            });
        });
    }

    function getVisibleClass(element) {
        const classList = element.classList;
        if (classList.contains('timeline-item')) return 'timeline-item--visible';
        if (classList.contains('turnos__step')) return 'turnos__step--visible';
        if (classList.contains('service-item')) return 'service-item--visible';
        if (classList.contains('pricing-card')) return 'pricing-card--visible';
        if (classList.contains('about__content')) return 'about__content--visible';
        if (classList.contains('about__visual')) return 'about__visual--visible';
        if (classList.contains('contact__info')) return 'contact__info--visible';
        if (classList.contains('contact__form-wrapper')) return 'contact__form-wrapper--visible';
        return 'animate-on-scroll--visible';
    }

    // === TIMELINE PROGRESS ===
    function setupTimelineProgress() {
        if (!elements.timelineProgress) return;
        updateTimelineProgress();
    }

    function updateTimelineProgress() {
        if (!elements.timelineProgress) return;

        const timelineSection = elements.timelineProgress.closest('.timeline-section');
        if (!timelineSection) return;

        const rect = timelineSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Calculate progress based on how much of the section has been scrolled
        let progress = 0;

        if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
            // Section is in view
            const scrolled = windowHeight - sectionTop;
            const totalScroll = sectionHeight + windowHeight;
            progress = Math.min(Math.max((scrolled / totalScroll) * 100, 0), 100);
        } else if (sectionTop <= -sectionHeight) {
            // Section is completely scrolled past
            progress = 100;
        }

        elements.timelineProgress.style.height = `${progress}%`;
    }

    // === WAVE GENERATION ===
    function generateWavePath(options = {}) {
        const {
            amplitude = 20,
            frequency = 2,
            phase = 0,
            points = 100
        } = options;

        let path = 'M0,50';

        for (let i = 0; i <= points; i++) {
            const x = (i / points) * 100;
            const y = 50 + Math.sin((i / points) * Math.PI * frequency + phase) * amplitude;
            path += ` L${x},${y}`;
        }

        path += ' L100,100 L0,100 Z';
        return path;
    }

    // === PUBLIC API ===
    window.DoctoreTimeline = {
        switchLanguage: updateLanguage,
        getCurrentLang: () => state.currentLang,
        generateWavePath: generateWavePath
    };

    // === INIT ON DOM READY ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
