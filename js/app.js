/**
 * Maklarhuset Landing Page - Main Application Script
 * Handles i18n, UI interactions, animations, and smooth scrolling
 */

// Global state
let currentLanguage = 'sv'; // Default to Swedish for Maklarhuset
let isNavOpen = false;

/**
 * LANGUAGE SWITCHING (i18n)
 */

/**
 * Detect browser language from navigator
 * Returns one of: 'sv', 'de', 'nl', or 'en'
 * Falls back to 'sv' (Swedish) as default for this Swedish property
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langPrefix = browserLang.split('-')[0].toLowerCase();

  const supportedLanguages = ['sv', 'de', 'nl', 'en'];
  return supportedLanguages.includes(langPrefix) ? langPrefix : 'sv'; // Default to 'sv' for Swedish property
}

/**
 * Set the current language and update all translatable elements
 * @param {string} lang - Language code: 'sv', 'de', 'nl', 'en'
 */
function setLanguage(lang) {
  // Validate language
  if (!translations[lang]) {
    console.warn(`Language '${lang}' not found in translations. Defaulting to 'sv'.`);
    lang = 'sv'; // Default to Swedish
  }

  currentLanguage = lang;

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Update all elements with data-i18n attribute for textContent
  const translatableElements = document.querySelectorAll('[data-i18n]');
  translatableElements.forEach((element) => {
    const translationKey = element.getAttribute('data-i18n');
    const translation = getNestedTranslation(translations[lang], translationKey);

    if (translation !== undefined) {
      // Fade out, change text, fade in
      element.style.opacity = '0.7';
      setTimeout(() => {
        element.textContent = translation;
        element.style.transition = 'opacity 0.3s ease-in-out';
        element.style.opacity = '1';
      }, 150);
    } else {
      console.warn(`Translation not found for key: ${translationKey}`);
    }
  });

  // Update placeholder translations
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach((element) => {
    const translationKey = element.getAttribute('data-i18n-placeholder');
    const translation = getNestedTranslation(translations[lang], translationKey);

    if (translation !== undefined) {
      element.placeholder = translation;
    }
  });

  // Update active state on language buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach((btn) => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
}

/**
 * Helper function to get nested object values using dot notation
 * @param {object} obj - Object to traverse
 * @param {string} path - Dot-separated path (e.g., 'hero.title')
 * @returns {any} The value at the path, or undefined
 */
function getNestedTranslation(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * SCROLL EFFECTS
 */

/**
 * Initialize intersection observer for .animate-in elements
 * Adds .visible class when elements scroll into view
 */
function initIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after becoming visible (one-time animation)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with animate-in class
  const animateElements = document.querySelectorAll('.animate-in');
  animateElements.forEach((element) => {
    observer.observe(element);
  });
}

/**
 * Handle scroll events for navigation styling and parallax effects
 * - Adds .scrolled class to .site-header after scrolling past 80px
 * - Applies parallax effect to .hero section
 */
function initScrollEffects() {
  const siteHeader = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Add .scrolled class to header after scrolling past 80px
    if (scrollPos > 80) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }

    // Subtle parallax effect on hero section
    if (hero && scrollPos < 800) {
      const parallaxOffset = scrollPos * 0.5;
      hero.style.backgroundPosition = `center ${parallaxOffset}px`;
    }
  });
}

/**
 * MOBILE NAVIGATION
 */

/**
 * Initialize mobile navigation toggle
 * - Toggles .nav-open class on .site-header when .nav-toggle is clicked
 * - Closes nav when a .nav-link is clicked
 * - Closes nav when clicking outside the header
 */
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const siteHeader = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle nav on button click
  navToggle?.addEventListener('click', () => {
    isNavOpen = !isNavOpen;
    siteHeader?.classList.toggle('nav-open');
  });

  // Close nav when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      isNavOpen = false;
      siteHeader?.classList.remove('nav-open');
    });
  });

  // Close nav when clicking outside the header
  document.addEventListener('click', (e) => {
    if (!siteHeader?.contains(e.target) && !navToggle?.contains(e.target)) {
      if (isNavOpen) {
        isNavOpen = false;
        siteHeader?.classList.remove('nav-open');
      }
    }
  });
}

/**
 * SMOOTH SCROLLING
 */

/**
 * Initialize smooth scrolling for anchor links
 * Calculates offset based on .site-header height
 */
function initSmoothScrolling() {
  const siteHeader = document.querySelector('.site-header');
  const navHeight = siteHeader?.offsetHeight || 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip empty hash
      if (href === '#') return;

      e.preventDefault();

      const targetElement = document.querySelector(href);
      if (!targetElement) return;

      const targetPosition = targetElement.offsetTop - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });
}

/**
 * CONTACT FORM
 */

/**
 * Initialize contact form with validation and success message
 * Finds form via #contactForm selector
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = contactForm.querySelector('[name="name"]');
    const emailInput = contactForm.querySelector('[name="email"]');

    // Simple validation
    if (!nameInput?.value.trim()) {
      showNotification('Please enter your name', 'error');
      return;
    }

    if (!emailInput?.value.trim() || !isValidEmail(emailInput.value)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Show success message using translation
    const successMessage =
      getNestedTranslation(translations[currentLanguage], 'contact.success') ||
      'Thank you! Your inquiry has been sent.';

    showNotification(successMessage, 'success');

    // Reset form
    contactForm.reset();

    // In production, you would send the form data to a server here
    // Example:
    // fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name: nameInput.value,
    //     email: emailInput.value,
    //     message: contactForm.querySelector('[name="message"]')?.value || ''
    //   })
    // }).then(...).catch(...);
  });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show a temporary notification/toast message
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success' or 'error'
 */
function showNotification(message, type = 'success') {
  // Create notification container if it doesn't exist
  let notificationContainer = document.getElementById('notificationContainer');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notificationContainer';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      font-family: inherit;
    `;
    document.body.appendChild(notificationContainer);
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    padding: 16px 24px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    ${
      type === 'success'
        ? 'background-color: #4CAF50; color: white;'
        : 'background-color: #f44336; color: white;'
    }
  `;
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

/**
 * COUNTER ANIMATION
 */

/**
 * Initialize counter animations for elements with .counter class
 * Looks for data-target attribute on counter elements
 */
function initCounterAnimation() {
  const counterOptions = {
    threshold: 0.5,
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        animateCounter(entry.target);
        entry.target.classList.add('counted');
        counterObserver.unobserve(entry.target);
      }
    });
  }, counterOptions);

  const counters = document.querySelectorAll('.counter');
  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });
}

/**
 * Animate a counter from 0 to target value
 * @param {HTMLElement} element - Counter element with data-target attribute
 */
function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'), 10);
  if (isNaN(target)) return;

  const duration = 2000; // 2 seconds
  const startTime = performance.now();
  const startValue = 0;

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuad);

    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(updateCounter);
}

/**
 * HERO PARALLAX
 */

/**
 * Initialize hero parallax effect
 * The parallax scroll effect is already handled in initScrollEffects()
 * This ensures proper CSS initialization
 */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Set initial background properties if not already set
  if (!hero.style.backgroundAttachment) {
    hero.style.backgroundAttachment = 'fixed';
  }
  if (!hero.style.backgroundSize) {
    hero.style.backgroundSize = 'cover';
  }
  if (!hero.style.backgroundPosition) {
    hero.style.backgroundPosition = 'center';
  }
}

/**
 * CSS ANIMATIONS
 */

/**
 * Inject animation keyframes into the document
 * Includes slideIn/slideOut for notifications and fade transitions for i18n
 */
function injectAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    /* Default fade transition for language changes */
    [data-i18n] {
      transition: opacity 0.3s ease-in-out;
    }

    /* Smooth scroll behavior */
    html {
      scroll-behavior: smooth;
    }
  `;
  document.head.appendChild(style);
}

/**
 * INITIALIZATION
 */

/**
 * Initialize all features on DOM ready
 * - Loads translations from global translations object
 * - Detects browser language (defaults to 'sv' for Swedish)
 * - Sets up all event listeners and observers
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if translations are available
  if (typeof translations === 'undefined') {
    console.error('translations object not found. Make sure translations.js is loaded before app.js');
    return;
  }

  // Detect and set initial language (defaults to 'sv')
  const detectedLang = detectBrowserLanguage();
  setLanguage(detectedLang);

  // Set up language switcher buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Initialize all features
  injectAnimationStyles();
  initHeroParallax();
  initScrollEffects();
  initIntersectionObserver();
  initMobileNav();
  initSmoothScrolling();
  initContactForm();
  initCounterAnimation();

  console.log(`Maklarhuset Landing Page initialized with language: ${currentLanguage}`);
});

/**
 * Handle language changes dynamically
 * For example, if page content is added dynamically after initialization
 */
function reinitializeTranslations() {
  initIntersectionObserver();
  initCounterAnimation();
}

/**
 * Utility: Get current language
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Utility: Manually set language with full reinitialization
 * @param {string} lang - Language code to set
 */
function setLanguageFully(lang) {
  setLanguage(lang);
  reinitializeTranslations();
}

// Export utilities for potential external use
window.appUtils = {
  setLanguage: setLanguageFully,
  getCurrentLanguage,
  reinitializeTranslations,
  showNotification,
};
