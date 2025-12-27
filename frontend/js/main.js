class FeedbackApp {
    constructor() {
        this.isInitialized = false;
        this.animationObserver = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.initializeAnimations();
            this.initializeCounters();
            await this.checkAPIHealth();
            this.isInitialized = true;
            console.log('FeedbackApp initialized successfully');
        } catch (error) {
            console.error('Failed to initialize FeedbackApp:', error);
            this.showConnectionError();
        }
    }

    setupEventListeners() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Mobile menu toggle (if needed)
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
        }

        // Form enhancements
        this.enhanceForms();

        // Window scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    initializeAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.feature-card, .stat-item, .metric-card');
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            this.animationObserver.observe(el);
        });
    }

    initializeCounters() {
        const counters = document.querySelectorAll('[data-target]');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000; // 2 seconds
            const start = 0;
            const increment = target / (duration / 16); // 60fps
            
            let current = start;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            updateCounter();
        };

        // Animate counters when they come into view
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    enhanceForms() {
        // Add loading states to form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn && !form.classList.contains('no-loading')) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
            });
        });

        // Input validation feedback
        const inputs = document.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateInput);
            input.addEventListener('input', this.clearValidation);
        });
    }

    validateInput(event) {
        const input = event.target;
        const isValid = input.checkValidity();
        
        if (!isValid) {
            input.classList.add('error');
            this.showInputError(input);
        } else {
            input.classList.remove('error');
            this.clearInputError(input);
        }
    }

    clearValidation(event) {
        const input = event.target;
        input.classList.remove('error');
        this.clearInputError(input);
    }

    showInputError(input) {
        const errorId = `${input.id || input.name}-error`;
        let errorEl = document.getElementById(errorId);
        
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = errorId;
            errorEl.className = 'input-error';
            input.parentNode.appendChild(errorEl);
        }
        
        errorEl.textContent = input.validationMessage;
    }

    clearInputError(input) {
        const errorId = `${input.id || input.name}-error`;
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.remove();
        }
    }

    handleScroll() {
        // Navbar background on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    handleResize() {
        // Handle responsive layout changes
        this.updateChartSizes();
    }

    updateChartSizes() {
        // Trigger chart resize if Chart.js charts exist
        if (window.Chart) {
            Chart.helpers.each(Chart.instances, (instance) => {
                instance.resize();
            });
        }
    }

    async checkAPIHealth() {
        try {
            const isHealthy = await API.healthCheck();
            if (!isHealthy) {
                console.warn('API health check failed');
                this.showConnectionWarning();
            }
        } catch (error) {
            console.error('API health check error:', error);
            this.showConnectionError();
        }
    }

    showConnectionError() {
        const errorEl = document.createElement('div');
        errorEl.className = 'connection-error';
        errorEl.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span>Unable to connect to server. Some features may not work.</span>
                <button onclick="window.location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
        
        document.body.prepend(errorEl);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 10000);
    }

    showConnectionWarning() {
        console.warn('API connection warning - some features may be limited');
    }

    // Utility methods
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackApp = new FeedbackApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackApp;
}
