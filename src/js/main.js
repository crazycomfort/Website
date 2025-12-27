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
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    // DOM already loaded
    initThemeToggle();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
        }
    });
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav') && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle?.classList.remove('active');
    }
});

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
document.addEventListener('DOMContentLoaded', function() {
    const copyButtons = document.querySelectorAll('.copy-code-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-copy');
            const codeElement = document.getElementById(`code-${code}`);
            const feedback = document.getElementById(`feedback-${code}`);
            
            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(() => {
                    // Show feedback
                    feedback.classList.add('show');
                    
                    // Update button text
                    const copyText = this.querySelector('.copy-text');
                    if (copyText) {
                        copyText.textContent = 'Copied!';
                    }
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        feedback.classList.remove('show');
                        if (copyText) {
                            copyText.textContent = 'Copy';
                        }
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                feedback.classList.add('show');
                const copyText = this.querySelector('.copy-text');
                if (copyText) {
                    copyText.textContent = 'Copied!';
                }
                setTimeout(() => {
                    feedback.classList.remove('show');
                    if (copyText) {
                        copyText.textContent = 'Copy';
                    }
                }, 2000);
            }
        });
    });
});

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

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    const formMessage = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');
    
    // Check if form action is set up
    const formAction = contactForm.getAttribute('action');
    if (formAction && formAction.includes('YOUR_FORM_ID')) {
        console.warn('Formspree form ID not configured. Please set up your Formspree account and update the form action URL.');
    }
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if form is properly configured
        if (formAction && formAction.includes('YOUR_FORM_ID')) {
            formMessage.textContent = 'Form is not yet configured. Please contact us directly at (832) 633-8701 or ez@crazycomfort.com';
            formMessage.className = 'form-message form-message-error';
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        
        // Clear previous messages
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        
        // Get form data
        const formData = new FormData(contactForm);
        
        // Set reply-to email from form
        const emailInput = contactForm.querySelector('#email');
        if (emailInput && emailInput.value) {
            formData.set('_replyto', emailInput.value);
        }
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                formMessage.textContent = 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.';
                formMessage.className = 'form-message form-message-success';
                submitButton.textContent = 'Message Sent! ✓';
                submitButton.style.background = '#10b981';
                contactForm.reset();
                
                // Reset button after 5 seconds
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    formMessage.textContent = '';
                    formMessage.className = 'form-message';
                }, 5000);
            } else {
                // Error from Formspree
                const data = await response.json();
                throw new Error(data.error || 'There was an error submitting your form. Please try again.');
            }
        } catch (error) {
            // Network or other error
            formMessage.textContent = error.message || 'There was an error submitting your form. Please try again or call us at (832) 633-8701.';
            formMessage.className = 'form-message form-message-error';
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

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
