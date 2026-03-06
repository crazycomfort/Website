// DEV BUILD STAMP: 2026-01-17 12:00 (debug-lite)
console.log('[CrazyComfort] Build: 2026-01-17-1200');

// #region agent log - Bug chat disappearance (lightweight, throttled)
const DEBUG_LOG_ENDPOINT = 'http://127.0.0.1:7244/ingest/50e3056f-7000-49cf-b237-fd436abdf00e';
const DEBUG_SESSION_ID = 'debug-session';
const CHAT_LOG_MIN_INTERVAL_MS = 1500;
let lastChatLogTs = 0;

function sendDebugLog(hypothesisId, location, message, data = {}, runId = 'pre-fix') {
    const now = Date.now();
    // Throttle to avoid flooding
    if (now - lastChatLogTs < CHAT_LOG_MIN_INTERVAL_MS && hypothesisId !== 'B') return;
    lastChatLogTs = now;

    fetch(DEBUG_LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: DEBUG_SESSION_ID,
            runId,
            hypothesisId,
            location,
            message,
            data,
            timestamp: now
        })
    }).catch(() => {});
}

function captureBugChatState(trigger, hypothesisId = 'A', runId = 'pre-fix') {
    const candidates = Array.from(document.querySelectorAll('[data-bug-chat], [data-chat], .chat, [class*="chat"], [id*="chat"]'))
        .slice(0, 5)
        .map(el => ({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            textSample: (el.textContent || '').trim().slice(0, 120)
        }));

    sendDebugLog(
        hypothesisId,
        'main.js:captureBugChatState',
        `Bug chat state: ${trigger}`,
        {
            trigger,
            candidateCount: candidates.length,
            candidates,
            url: window.location.href,
            visibility: document.visibilityState
        },
        runId
    );
}

// Track the meta+alt+r key combo the user reported
window.addEventListener('keydown', (e) => {
    if (e.metaKey && e.altKey && (e.key === 'r' || e.key === 'R')) {
        sendDebugLog('B', 'main.js:keydown', 'meta+alt+r pressed', {
            metaKey: e.metaKey,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            key: e.key
        });
        captureBugChatState('meta+alt+r', 'B');
    }
});

// Capture state on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        captureBugChatState('domcontentloaded', 'A');
        setTimeout(() => captureBugChatState('post-domcontentloaded-500ms', 'A'), 500);
    });
} else {
    captureBugChatState('dom-already-ready', 'A');
    setTimeout(() => captureBugChatState('post-ready-500ms', 'A'), 500);
}

// Capture before page unload (helps distinguish refresh-driven disappearance)
window.addEventListener('beforeunload', () => {
    captureBugChatState('beforeunload', 'C');
});
// #endregion

// Dark Mode Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (!themeToggle) {
        console.error('Theme toggle button not found');
        return;
    }

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Remove any existing event listeners by cloning the button
    const newToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newToggle, themeToggle);

    // Add click event listener
    newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const currentToggle = document.getElementById('themeToggle');
        if (!currentToggle) return;
        
        const themeIcon = currentToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        } else {
            // Fallback: update button text directly if .theme-icon doesn't exist
            currentToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        // Update tooltip text
        currentToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    // DOM already loaded
    initThemeToggle();
}

// Let browser handle scroll restoration naturally (prevents mobile jumping)

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    function updateHeader() {
        if (window.scrollY > 10) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    // Run immediately
    updateHeader();
    
    // Run on scroll
    window.addEventListener('scroll', updateHeader, { passive: true });
    
    // Run again after a short delay to catch any race conditions
    setTimeout(updateHeader, 50);
}

// Initialize immediately and on DOMContentLoaded
initHeaderScroll();
document.addEventListener('DOMContentLoaded', initHeaderScroll);
requestAnimationFrame(() => initHeaderScroll());

// Mobile menu toggle - Declare these first
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

// Smooth scrolling for navigation links (exclude nomination button)
document.querySelectorAll('a[href^="#"]:not(#nominate-btn)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navMenu?.classList.remove('active');
            menuToggle?.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        // Lock/unlock body scroll
        document.body.classList.toggle('menu-open');
    });
}

// Close mobile menu when clicking outside (but not on nav links)
document.addEventListener('click', (e) => {
    // Don't interfere with nav link clicks
    if (e.target.closest('.nav-menu a')) {
        return; // Let the link work naturally
    }
    if (!e.target.closest('.nav') && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});

// Mobile dropdown toggle for Services
const hasDropdown = document.querySelector('.has-dropdown');
if (hasDropdown) {
    const dropdownLink = hasDropdown.querySelector(':scope > a');
    if (dropdownLink) {
        dropdownLink.addEventListener('click', (e) => {
            // Only toggle on mobile (when menu is in mobile mode)
            if (window.innerWidth <= 768) {
                e.preventDefault();
                hasDropdown.classList.toggle('mobile-open');
            }
        });
    }
}

// Stats Counter Animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };

    updateCounter();
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.classList.contains('animated')) {
                statNumber.classList.add('animated');
                animateCounter(statNumber);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
    statsObserver.observe(card);
});

// Testimonials Slider
let currentTestimonial = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialDots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.testimonial-btn.prev');
const nextBtn = document.querySelector('.testimonial-btn.next');

function showTestimonial(index) {
    testimonialCards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });
    testimonialDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    currentTestimonial = index;
}

function nextTestimonial() {
    const next = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(next);
}

function prevTestimonial() {
    const prev = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
    showTestimonial(prev);
}

nextBtn?.addEventListener('click', nextTestimonial);
prevBtn?.addEventListener('click', prevTestimonial);

testimonialDots.forEach((dot, index) => {
    dot.addEventListener('click', () => showTestimonial(index));
});

// Auto-rotate testimonials
let testimonialInterval = setInterval(nextTestimonial, 5000);

// Pause on hover
const testimonialsSlider = document.querySelector('.testimonials-slider');
testimonialsSlider?.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
testimonialsSlider?.addEventListener('mouseleave', () => {
    testimonialInterval = setInterval(nextTestimonial, 5000);
});

// Coupon Code Copy Functionality
function initCouponCopy() {
    const copyButtons = document.querySelectorAll('.copy-code-btn');
    
    if (copyButtons.length === 0) {
        console.warn('No copy buttons found');
        return;
    }
    
    copyButtons.forEach(button => {
        // Remove any existing listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const code = this.getAttribute('data-copy');
            if (!code) {
                console.error('No data-copy attribute found');
                return;
            }
            
            const feedback = document.getElementById(`feedback-${code}`);
            const copyText = this.querySelector('.copy-text');
            
            // Copy to clipboard
            const copyToClipboard = (text) => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    return navigator.clipboard.writeText(text);
                } else {
                    // Fallback for older browsers
                    return new Promise((resolve, reject) => {
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        
                        try {
                            const successful = document.execCommand('copy');
                            document.body.removeChild(textArea);
                            if (successful) {
                                resolve();
                            } else {
                                reject(new Error('Copy command failed'));
                            }
                        } catch (err) {
                            document.body.removeChild(textArea);
                            reject(err);
                        }
                    });
                }
            };
            
            copyToClipboard(code).then(() => {
                // Show feedback
                if (feedback) {
                    feedback.classList.add('show');
                }
                
                // Update button text
                if (copyText) {
                    copyText.textContent = 'Copied!';
                }
                
                // Reset after 2 seconds
                setTimeout(() => {
                    if (feedback) {
                        feedback.classList.remove('show');
                    }
                    if (copyText) {
                        copyText.textContent = 'Copy';
                    }
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                // Show error feedback
                if (copyText) {
                    copyText.textContent = 'Error';
                    setTimeout(() => {
                        copyText.textContent = 'Copy';
                    }, 2000);
                }
            });
        });
    });
}

// Initialize coupon copy on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCouponCopy);
} else {
    // DOM already loaded
    initCouponCopy();
}

// FAQ Accordion
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length === 0) {
        console.warn('No FAQ questions found');
        return;
    }
    
    faqQuestions.forEach(question => {
        // Remove any existing listeners by cloning
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
        
        newQuestion.addEventListener('click', (e) => {
            e.preventDefault();
            const faqItem = newQuestion.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Initialize FAQ on DOM ready
document.addEventListener('DOMContentLoaded', initFAQ);

// Form submission handler - Netlify Forms
// Netlify Forms handle submission automatically, we just add visual feedback
const allForms = document.querySelectorAll('form[data-netlify="true"]');
allForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }
        // Let the form submit naturally to Netlify
    });
});

// CTA button handler
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        document.querySelector('#contact').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.service-card, .about-content, .gallery-item, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-background');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add active state to navigation on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Service Read More Toggle
function initServiceReadMore() {
    const readMoreLinks = document.querySelectorAll('.service-read-more');
    
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceCard = this.closest('.service-card');
            const paragraph = serviceCard.querySelector('p');
            const isExpanded = paragraph.classList.contains('expanded');
            
            if (isExpanded) {
                paragraph.classList.remove('expanded');
                this.textContent = 'Read More';
                this.classList.remove('expanded');
            } else {
                paragraph.classList.add('expanded');
                this.textContent = 'Read Less';
                this.classList.add('expanded');
            }
        });
    });
}

// Initialize service read more on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceReadMore);
} else {
    initServiceReadMore();
}

// Nomination Modal
function initNominationModal() {
    const modal = document.getElementById('nomination-modal');
    const nominateBtn = document.getElementById('nominate-btn');
    const closeBtn = document.querySelector('.nomination-modal-close');
    const cancelBtn = document.querySelector('.nomination-modal-cancel');
    const overlay = document.querySelector('.nomination-modal-overlay');
    const form = document.querySelector('.nomination-form');
    const formMessage = document.getElementById('nomination-form-message');
    const submitButton = form?.querySelector('.nomination-submit');

    if (!modal || !nominateBtn) {
        console.warn('Nomination modal elements not found');
        return;
    }

    // Open modal
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on first input
        const firstInput = form?.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form message
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.className = 'nomination-form-message';
            formMessage.style.display = 'none';
        }
    }

    // Event listeners
    nominateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
        return false;
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Form submission
    if (form && submitButton) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;

            if (formMessage) {
                formMessage.textContent = '';
                formMessage.className = 'nomination-form-message';
                formMessage.style.display = 'none';
            }

            try {
                const formData = new FormData(form);
                const response = await fetch(form.getAttribute('action'), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (formMessage) {
                        formMessage.textContent = 'Thank you! Your nomination has been submitted successfully. We will review it and get back to you soon.';
                        formMessage.className = 'nomination-form-message success';
                        formMessage.style.display = 'block';
                    }
                    form.reset();
                    // Close modal after 3 seconds
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                if (formMessage) {
                    formMessage.textContent = error.message || 'There was an error submitting your nomination. Please try again or call us at (832) 633-8701.';
                    formMessage.className = 'nomination-form-message error';
                    formMessage.style.display = 'block';
                }
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// Initialize nomination modal on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNominationModal);
} else {
    initNominationModal();
}

// Trust Cards Scroll Animation - Checkmark Pop-up
function initTrustCardAnimations() {
    const trustCards = document.querySelectorAll('.trust-card');
    
    if (trustCards.length === 0) {
        return;
    }
    
    const trustObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a slight delay for each card to create a cascading effect
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150); // 150ms delay between each card
                
                // Stop observing once animated
                trustObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });
    
    trustCards.forEach(card => {
        trustObserver.observe(card);
    });
}

// Initialize trust card animations on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrustCardAnimations);
} else {
    initTrustCardAnimations();
}

// Evidence Pack Carousel
function initEvidenceCarousel() {
    const carousel = document.querySelector('[data-evidence-carousel]');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.evidence-slide');
    const prevBtn = carousel.querySelector('.evidence-nav-prev');
    const nextBtn = carousel.querySelector('.evidence-nav-next');
    const dotsContainer = document.querySelector('[data-evidence-dots]');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.evidence-dot') : [];
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Click on dots to navigate
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentSlide = i;
            showSlide(currentSlide);
        });
    });

    // Auto-rotate every 5 seconds
    setInterval(nextSlide, 5000);
}

// Attic Modal
function initAtticModal() {
    const openBtn = document.querySelector('[data-open-attic-modal]');
    const modal = document.getElementById('attic-modal');
    const closeBtn = modal?.querySelector('.attic-modal-close');
    const overlay = modal?.querySelector('.attic-modal-overlay');

    if (!openBtn || !modal) return;

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Scroll-based animations for headlines
function initScrollAnimations() {
    const headlines = document.querySelectorAll('.homepage-headline');
    
    const headlineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    headlines.forEach(headline => {
        headlineObserver.observe(headline);
    });
}

// ============================================
// AI CHATBOT WIDGET
// ============================================

function initChatbot() {
    // Don't show on review page or other special pages
    if (window.location.pathname.includes('leave-review')) return;
    
    // Create chatbot HTML
    const chatbotHTML = `
        <div class="chatbot-widget">
            <button class="chatbot-toggle" aria-label="Open chat">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                <span class="chatbot-badge">1</span>
            </button>
            <div class="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">👋</div>
                    <div class="chatbot-header-text">
                        <h4>Crazy Comfort</h4>
                        <p class="chatbot-status">Online now</p>
                    </div>
                </div>
                <div class="chatbot-messages" id="chatMessages">
                    <div class="chat-message bot">
                        Hey there! 👋 I'm here to help with your HVAC questions. What can I help you with today?
                        <div class="chat-quick-replies">
                            <button class="quick-reply-btn" data-reply="schedule">Schedule Service</button>
                            <button class="quick-reply-btn" data-reply="areas">Service Areas</button>
                            <button class="quick-reply-btn" data-reply="emergency">Emergency Help</button>
                            <button class="quick-reply-btn" data-reply="pricing">Get a Quote</button>
                        </div>
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" class="chatbot-input" placeholder="Type your message..." id="chatInput">
                    <button class="chatbot-send" id="chatSend">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    
    const toggle = document.querySelector('.chatbot-toggle');
    const chatWindow = document.querySelector('.chatbot-window');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const messagesContainer = document.getElementById('chatMessages');
    const badge = document.querySelector('.chatbot-badge');
    
    // Toggle chat window
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            badge.style.display = 'none';
            chatInput.focus();
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_opened', { 'event_category': 'Engagement' });
            }
        }
    });
    
    // Chat responses
    const responses = {
        schedule: {
            text: "Great! You can schedule service by calling us at <a href='tel:832-403-7466'>832-403-7466</a> or <a href='/contact'>filling out our online form</a>. We offer same-day service!",
            followUp: ["What's your availability?", "Do you offer financing?", "Talk to a human"]
        },
        areas: {
            text: "We serve Katy, Fulshear, Richmond, Sugar Land, Cinco Ranch, Brookshire, Simonton, Sealy, and surrounding West Houston areas. Are you in one of these areas?",
            followUp: ["Yes, I'm in the area", "I'm not sure", "Schedule service"]
        },
        emergency: {
            text: "For HVAC emergencies, call us right now at <a href='tel:832-403-7466'>832-403-7466</a>. We're available 24/7 for qualified emergencies like complete system failures during extreme weather.",
            followUp: ["Call now", "It can wait", "Schedule for later"]
        },
        pricing: {
            text: "Our pricing depends on the service needed. AC tune-ups start at $89, and repairs vary based on the issue. Want to schedule a diagnostic visit? It includes a full inspection with photo documentation.",
            followUp: ["Schedule diagnostic", "Maintenance plans", "Call for quote"]
        },
        "yes, i'm in the area": {
            text: "Perfect! We'd love to help. Would you like to schedule service or get a quote?",
            followUp: ["Schedule service", "Get a quote", "Learn more"]
        },
        "call now": {
            text: "Calling is the fastest way to get help. Dial <a href='tel:832-403-7466'>832-403-7466</a> now and we'll get you taken care of!",
            followUp: []
        },
        "schedule diagnostic": {
            text: "Great choice! Our diagnostic includes a full system inspection with real-time photos so you see exactly what we see. Call <a href='tel:832-403-7466'>832-403-7466</a> or <a href='/contact'>book online</a>.",
            followUp: ["Book online", "Call now"]
        },
        "maintenance plans": {
            text: "Our maintenance plan is $215/year (or $21.99/month) and includes annual tune-ups plus discounts on repairs. <a href='/hvac-maintenance-plan'>Learn more here</a>.",
            followUp: ["Sign up", "More questions"]
        },
        "talk to a human": {
            text: "Of course! Call us at <a href='tel:832-403-7466'>832-403-7466</a> and a real person will answer. We're available during business hours.",
            followUp: []
        },
        default: {
            text: "Thanks for your message! For the fastest response, call us at <a href='tel:832-403-7466'>832-403-7466</a>. Or let me know what you need help with:",
            followUp: ["Schedule Service", "Service Areas", "Get a Quote"]
        }
    };
    
    function addMessage(text, isUser = false) {
        const msg = document.createElement('div');
        msg.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        msg.innerHTML = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function addQuickReplies(replies) {
        if (!replies || replies.length === 0) return;
        
        const container = document.createElement('div');
        container.className = 'chat-quick-replies';
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = reply;
            btn.dataset.reply = reply.toLowerCase();
            container.appendChild(btn);
        });
        messagesContainer.appendChild(container);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function handleUserMessage(message) {
        addMessage(message, true);
        
        // Remove old quick replies
        document.querySelectorAll('.chat-quick-replies').forEach(el => el.remove());
        
        const key = message.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        const response = responses[key] || responses.default;
        
        // Simulate typing delay
        setTimeout(() => {
            addMessage(response.text);
            if (response.followUp && response.followUp.length > 0) {
                setTimeout(() => addQuickReplies(response.followUp), 300);
            }
        }, 500);
        
        // Track in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chatbot_message', { 
                'event_category': 'Engagement',
                'event_label': message
            });
        }
    }
    
    // Quick reply buttons
    messagesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-reply-btn')) {
            handleUserMessage(e.target.textContent);
        }
    });
    
    // Send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            handleUserMessage(message);
            chatInput.value = '';
        }
    }
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// ============================================
// EXIT-INTENT POPUP
// ============================================

function initExitPopup() {
    // Don't show on certain pages
    const excludedPaths = ['/leave-review', '/contact', '/spring-ac-tuneup'];
    if (excludedPaths.some(path => window.location.pathname.includes(path))) return;
    
    // Check if already shown or dismissed
    if (sessionStorage.getItem('exitPopupShown') || localStorage.getItem('exitPopupDismissed')) return;
    
    const popupHTML = `
        <div class="exit-popup-overlay" id="exitPopup">
            <div class="exit-popup">
                <button class="exit-popup-close" aria-label="Close">&times;</button>
                <div class="exit-popup-header">
                    <h2>Wait! Before You Go...</h2>
                    <div class="exit-popup-discount">$50 OFF</div>
                    <p>Your First Service Call</p>
                </div>
                <div class="exit-popup-content">
                    <p>Get $50 off your first AC repair or tune-up. Just enter your info below and we'll send your exclusive discount code.</p>
                    <form class="exit-popup-form" name="exit-popup" method="POST" data-netlify="true" netlify-honeypot="bot-field" id="exitPopupForm">
                        <input type="hidden" name="form-name" value="exit-popup">
                        <p style="display:none"><input name="bot-field"></p>
                        <input type="text" name="name" placeholder="Your Name" required>
                        <input type="tel" name="phone" placeholder="Phone Number" required>
                        <input type="email" name="email" placeholder="Email Address" required>
                        <button type="submit" class="exit-popup-submit">Get My $50 Discount</button>
                    </form>
                    <button class="exit-popup-skip" id="exitPopupSkip">No thanks, I'll pay full price</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    const popup = document.getElementById('exitPopup');
    const closeBtn = popup.querySelector('.exit-popup-close');
    const skipBtn = document.getElementById('exitPopupSkip');
    const form = document.getElementById('exitPopupForm');
    
    function showPopup() {
        popup.classList.add('active');
        sessionStorage.setItem('exitPopupShown', 'true');
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exit_popup_shown', { 'event_category': 'Engagement' });
        }
    }
    
    function hidePopup(permanent = false) {
        popup.classList.remove('active');
        if (permanent) {
            localStorage.setItem('exitPopupDismissed', 'true');
        }
    }
    
    // Exit intent detection (desktop only)
    let exitTriggered = false;
    document.addEventListener('mouseout', (e) => {
        if (exitTriggered) return;
        if (e.clientY < 10 && e.relatedTarget === null) {
            exitTriggered = true;
            setTimeout(showPopup, 100);
        }
    });
    
    // Mobile: Show after 30 seconds of engagement
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            if (!exitTriggered && !sessionStorage.getItem('exitPopupShown')) {
                exitTriggered = true;
                showPopup();
            }
        }, 30000);
    }
    
    // Close handlers
    closeBtn.addEventListener('click', () => hidePopup(true));
    skipBtn.addEventListener('click', () => hidePopup(true));
    popup.addEventListener('click', (e) => {
        if (e.target === popup) hidePopup();
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exit_popup_conversion', { 'event_category': 'Lead' });
            }
            
            // Show success
            form.innerHTML = `
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">You're All Set!</h3>
                    <p style="color: var(--text-light);">We'll text you your discount code shortly. Call <a href="tel:832-403-7466">832-403-7466</a> to use it!</p>
                </div>
            `;
            
            setTimeout(() => hidePopup(true), 5000);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error. Please call 832-403-7466 for your discount.');
        });
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initEvidenceCarousel();
        initAtticModal();
        initScrollAnimations();
        initChatbot();
        initExitPopup();
    });
} else {
    initEvidenceCarousel();
    initAtticModal();
    initScrollAnimations();
    initChatbot();
    initExitPopup();
}
