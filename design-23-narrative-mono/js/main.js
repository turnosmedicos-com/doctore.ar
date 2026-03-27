/* ==========================================================================
   Design 23 - Narrative Mono (Hybrid)
   Main JavaScript
   Combines: Narrative (5) + Mono (19) + Enterprise (16)
   ========================================================================== */

(function() {
    'use strict';

    /* ==========================================================================
       Configuration
       ========================================================================== */

    var CONFIG = {
        defaultLang: 'es',
        supportedLangs: ['es', 'en'],
        storageKey: 'doctore-lang',
        animationThreshold: 0.15,
        animationRootMargin: '0px 0px -50px 0px'
    };

    /* ==========================================================================
       State
       ========================================================================== */

    var currentLang = CONFIG.defaultLang;
    var translations = {};

    /* ==========================================================================
       DOM Elements
       ========================================================================== */

    var elements = {
        nav: null,
        langButtons: null,
        revealElements: null,
        progressDots: null,
        sections: null
    };

    /* ==========================================================================
       Initialization
       ========================================================================== */

    function init() {
        cacheElements();
        initLanguage();
        initNavScroll();
        initRevealAnimations();
        initProgressIndicator();
        initSmoothScroll();
    }

    function cacheElements() {
        elements.nav = document.querySelector('.nav');
        elements.langButtons = document.querySelectorAll('.nav__lang-btn');
        elements.revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        elements.progressDots = document.querySelectorAll('.progress-indicator__dot');
        elements.sections = document.querySelectorAll('section[id]');
    }

    /* ==========================================================================
       Language System
       ========================================================================== */

    function initLanguage() {
        var savedLang = localStorage.getItem(CONFIG.storageKey);
        var browserLang = navigator.language.split('-')[0];

        currentLang = savedLang ||
            (CONFIG.supportedLangs.indexOf(browserLang) !== -1 ? browserLang : CONFIG.defaultLang);

        loadTranslations(currentLang).then(function() {
            applyTranslations();
            updateLangButtons();
        });

        for (var i = 0; i < elements.langButtons.length; i++) {
            elements.langButtons[i].addEventListener('click', handleLangSwitch);
        }
    }

    function loadTranslations(lang) {
        return fetch('./lang/' + lang + '.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load translations');
                }
                return response.json();
            })
            .then(function(data) {
                translations = data;
            })
            .catch(function(error) {
                console.error('Error loading translations:', error);
                if (lang !== CONFIG.defaultLang) {
                    return loadTranslations(CONFIG.defaultLang);
                }
            });
    }

    function applyTranslations() {
        var translatableElements = document.querySelectorAll('[data-i18n]');

        for (var i = 0; i < translatableElements.length; i++) {
            var element = translatableElements[i];
            var key = element.getAttribute('data-i18n');
            var translation = getNestedTranslation(key);

            if (translation) {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        }

        document.documentElement.lang = currentLang;
    }

    function getNestedTranslation(key) {
        var keys = key.split('.');
        var value = translations;

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }

        return typeof value === 'string' ? value : null;
    }

    function handleLangSwitch(event) {
        var btn = event.currentTarget;
        var lang = btn.getAttribute('data-lang');

        if (lang === currentLang) return;

        currentLang = lang;
        localStorage.setItem(CONFIG.storageKey, lang);

        loadTranslations(lang).then(function() {
            applyTranslations();
            updateLangButtons();
        });
    }

    function updateLangButtons() {
        for (var i = 0; i < elements.langButtons.length; i++) {
            var btn = elements.langButtons[i];
            var isActive = btn.getAttribute('data-lang') === currentLang;
            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    }

    /* ==========================================================================
       Navigation Scroll Effect
       ========================================================================== */

    function initNavScroll() {
        function handleScroll() {
            var scrolled = window.scrollY > 50;
            if (scrolled) {
                elements.nav.classList.add('nav--scrolled');
            } else {
                elements.nav.classList.remove('nav--scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /* ==========================================================================
       Reveal Animations (Intersection Observer)
       ========================================================================== */

    function initRevealAnimations() {
        if (!('IntersectionObserver' in window)) {
            for (var i = 0; i < elements.revealElements.length; i++) {
                elements.revealElements[i].classList.add('active');
            }
            return;
        }

        var observer = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            }
        }, {
            threshold: CONFIG.animationThreshold,
            rootMargin: CONFIG.animationRootMargin
        });

        for (var j = 0; j < elements.revealElements.length; j++) {
            observer.observe(elements.revealElements[j]);
        }
    }

    /* ==========================================================================
       Progress Indicator
       ========================================================================== */

    function initProgressIndicator() {
        if (elements.sections.length === 0 || elements.progressDots.length === 0) return;

        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    var sectionId = entry.target.id;
                    updateProgressIndicator(sectionId);
                }
            }
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });

        for (var i = 0; i < elements.sections.length; i++) {
            observer.observe(elements.sections[i]);
        }

        for (var j = 0; j < elements.progressDots.length; j++) {
            elements.progressDots[j].addEventListener('click', function() {
                var targetId = this.getAttribute('data-section');
                var targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    function updateProgressIndicator(sectionId) {
        for (var i = 0; i < elements.progressDots.length; i++) {
            var dot = elements.progressDots[i];
            var isActive = dot.getAttribute('data-section') === sectionId;
            if (isActive) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        }
    }

    /* ==========================================================================
       Smooth Scroll for Anchor Links
       ========================================================================== */

    function initSmoothScroll() {
        var anchors = document.querySelectorAll('a[href^="#"]');

        for (var i = 0; i < anchors.length; i++) {
            anchors[i].addEventListener('click', function(e) {
                var href = this.getAttribute('href');

                if (href === '#') return;

                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    /* ==========================================================================
       Start Application
       ========================================================================== */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
