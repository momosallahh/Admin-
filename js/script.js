// ============================================
// ELITE ROOFING - INTERACTIVE SCRIPT
// Premium Roofing Website JavaScript
// ============================================

// === GLOBAL STATE ===
let calculatorState = {
    roofType: 'shingle',
    roofSize: 1500,
    damageLevel: 'minor',
    addons: []
};

// === PRICING CONSTANTS ===
const PRICING = {
    basePrice: 3.50,
    roofTypeMultipliers: {
        shingle: 1.0,
        metal: 1.4,
        tile: 1.6,
        flat: 0.9
    },
    damageMultipliers: {
        minor: 1.0,
        moderate: 1.15,
        heavy: 1.3
    },
    addons: {
        gutters: 950,
        insulation: 600,
        pdf: 85,
        fascia: 450
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initSmoothScroll();
    initCalculator();
    initReviewsCarousel();
    initBeforeAfterSliders();
    initServiceMap();
    initBookingForm();
    initMobileMenu();
    initScrollAnimations();
    generateFloatingParticles();
});

// ============================================
// STICKY HEADER
// ============================================

function initStickyHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// CALCULATOR
// ============================================

function initCalculator() {
    // Roof Type Selection
    document.querySelectorAll('input[name="roofType"]').forEach(input => {
        input.addEventListener('change', (e) => {
            calculatorState.roofType = e.target.value;
            updateCalculator();
        });
    });

    // Roof Size Slider
    const roofSizeSlider = document.getElementById('roofSize');
    const roofSizeValue = document.getElementById('roofSizeValue');

    roofSizeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        roofSizeValue.textContent = value.toLocaleString();
        calculatorState.roofSize = value;
        updateCalculator();
    });

    // Damage Level Selection
    document.querySelectorAll('input[name="damageLevel"]').forEach(input => {
        input.addEventListener('change', (e) => {
            calculatorState.damageLevel = e.target.value;
            updateCalculator();
        });
    });

    // Add-ons Selection
    document.querySelectorAll('input[name="addons"]').forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                calculatorState.addons.push(e.target.value);
            } else {
                calculatorState.addons = calculatorState.addons.filter(
                    addon => addon !== e.target.value
                );
            }
            updateCalculator();
        });
    });

    // Initial calculation
    updateCalculator();
}

function updateCalculator() {
    const result = calculatePrice();
    updateCalculatorDisplay(result);
}

function calculatePrice() {
    // Base cost
    let baseCost = calculatorState.roofSize * PRICING.basePrice;

    // Apply roof type multiplier
    baseCost *= PRICING.roofTypeMultipliers[calculatorState.roofType];

    // Apply damage multiplier
    baseCost *= PRICING.damageMultipliers[calculatorState.damageLevel];

    // Add addons
    let addonsCost = 0;
    calculatorState.addons.forEach(addon => {
        addonsCost += PRICING.addons[addon];
    });

    const totalCost = baseCost + addonsCost;

    // Calculate range (±20%)
    const minPrice = totalCost * 0.9;
    const maxPrice = totalCost * 1.2;

    return {
        baseCost,
        addonsCost,
        totalCost,
        minPrice,
        maxPrice
    };
}

function updateCalculatorDisplay(result) {
    // Update price display
    const priceValue = document.getElementById('priceValue');
    priceValue.textContent = `$${Math.round(result.minPrice).toLocaleString()} - $${Math.round(result.maxPrice).toLocaleString()}`;

    // Add animation
    priceValue.style.transform = 'scale(1.05)';
    setTimeout(() => {
        priceValue.style.transform = 'scale(1)';
    }, 200);

    // Update summary
    const summary = document.getElementById('resultsSummary');
    const roofTypeNames = {
        shingle: 'Shingle',
        metal: 'Metal',
        tile: 'Tile',
        flat: 'Flat'
    };

    summary.innerHTML = `
        <p><strong>Project Summary:</strong></p>
        <p>${calculatorState.roofSize.toLocaleString()} sq ft ${roofTypeNames[calculatorState.roofType]} roof with ${calculatorState.damageLevel} damage${calculatorState.addons.length > 0 ? ' + ' + calculatorState.addons.length + ' add-ons' : ''}</p>
    `;

    // Update breakdown
    const breakdown = document.getElementById('resultsBreakdown');
    let breakdownHTML = `
        <div class="breakdown-item">
            <span>Base Cost (${calculatorState.roofSize.toLocaleString()} sq ft @ $${PRICING.basePrice})</span>
            <span>$${Math.round(calculatorState.roofSize * PRICING.basePrice).toLocaleString()}</span>
        </div>
    `;

    // Roof type multiplier
    if (calculatorState.roofType !== 'shingle') {
        const multiplierPercent = ((PRICING.roofTypeMultipliers[calculatorState.roofType] - 1) * 100).toFixed(0);
        breakdownHTML += `
            <div class="breakdown-item">
                <span>${roofTypeNames[calculatorState.roofType]} Roof ${multiplierPercent > 0 ? '+' : ''}${multiplierPercent}%</span>
                <span>Included</span>
            </div>
        `;
    }

    // Damage multiplier
    if (calculatorState.damageLevel !== 'minor') {
        const multiplierPercent = ((PRICING.damageMultipliers[calculatorState.damageLevel] - 1) * 100).toFixed(0);
        breakdownHTML += `
            <div class="breakdown-item">
                <span>${calculatorState.damageLevel.charAt(0).toUpperCase() + calculatorState.damageLevel.slice(1)} Damage +${multiplierPercent}%</span>
                <span>Included</span>
            </div>
        `;
    }

    // Add-ons
    calculatorState.addons.forEach(addon => {
        const addonNames = {
            gutters: 'Gutter Replacement',
            insulation: 'Attic Insulation',
            pdf: 'Inspection Report PDF',
            fascia: 'Fascia/Soffit Repairs'
        };
        breakdownHTML += `
            <div class="breakdown-item">
                <span>${addonNames[addon]}</span>
                <span>+$${PRICING.addons[addon].toLocaleString()}</span>
            </div>
        `;
    });

    breakdown.innerHTML = breakdownHTML;

    // Update urgency tag
    const urgencyTag = document.getElementById('urgencyTag');
    if (calculatorState.damageLevel === 'heavy') {
        urgencyTag.textContent = 'URGENT - Priority Service';
        urgencyTag.style.background = 'rgba(239, 68, 68, 0.2)';
        urgencyTag.style.color = '#EF4444';
    } else if (calculatorState.damageLevel === 'moderate') {
        urgencyTag.textContent = 'High Priority';
        urgencyTag.style.background = 'rgba(251, 191, 36, 0.2)';
        urgencyTag.style.color = '#FBBF24';
    } else {
        urgencyTag.textContent = 'Standard Priority';
        urgencyTag.style.background = 'rgba(56, 189, 248, 0.2)';
        urgencyTag.style.color = '#38BDF8';
    }
}

// ============================================
// REVIEWS CAROUSEL
// ============================================

function initReviewsCarousel() {
    const container = document.querySelector('.reviews-container');
    const prevBtn = document.getElementById('prevReview');
    const nextBtn = document.getElementById('nextReview');

    if (!container || !prevBtn || !nextBtn) return;

    const cardWidth = 380; // card width + gap

    prevBtn.addEventListener('click', () => {
        container.scrollBy({
            left: -cardWidth,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        container.scrollBy({
            left: cardWidth,
            behavior: 'smooth'
        });
    });

    // Auto-scroll every 5 seconds
    setInterval(() => {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
            container.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            container.scrollBy({
                left: cardWidth,
                behavior: 'smooth'
            });
        }
    }, 5000);
}

// ============================================
// BEFORE/AFTER SLIDERS
// ============================================

function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.comparison-slider');

    sliders.forEach(slider => {
        const container = slider.closest('.before-after-slider');
        const afterImage = container.querySelector('.image-after');

        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            afterImage.style.clipPath = `polygon(${value}% 0, 100% 0, 100% 100%, ${value}% 100%)`;
        });
    });
}

// ============================================
// SERVICE AREA MAP
// ============================================

function initServiceMap() {
    const regions = document.querySelectorAll('.service-region');
    const tooltip = document.getElementById('mapTooltip');

    regions.forEach(region => {
        region.addEventListener('mouseenter', (e) => {
            const city = region.getAttribute('data-city');
            const tooltipCity = tooltip.querySelector('.tooltip-city');
            tooltipCity.textContent = city;
            tooltip.style.display = 'block';
        });

        region.addEventListener('mousemove', (e) => {
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = (e.clientX - rect.left) + 'px';
            tooltip.style.top = (e.clientY - rect.top - 60) + 'px';
        });

        region.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}

// ============================================
// BOOKING FORM
// ============================================

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    const confirmation = document.getElementById('bookingConfirmation');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            preferredDate: document.getElementById('preferredDate').value,
            address: document.getElementById('address').value,
            damageDescription: document.getElementById('damageDescription').value
        };

        console.log('Booking submitted:', formData);

        // Show confirmation
        form.style.display = 'none';
        confirmation.classList.add('show');

        // Scroll to confirmation
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // You would typically send this data to your backend here
        // Example: sendBookingToServer(formData);
    });
}

// Reset booking form
function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    const confirmation = document.getElementById('bookingConfirmation');

    form.reset();
    form.style.display = 'block';
    confirmation.classList.remove('show');

    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('.nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    // Close menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            toggle.classList.remove('active');
        });
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    document.querySelectorAll('.service-card, .gallery-item, .trust-badge, .review-card').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// FLOATING PARTICLES
// ============================================

function generateFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    // Create additional floating elements
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 300 + 100}px;
            height: ${Math.random() * 300 + 100}px;
            border-radius: 50%;
            background: ${i % 2 === 0 ? 'var(--neon-primary)' : 'var(--neon-secondary)'};
            filter: blur(${Math.random() * 80 + 60}px);
            opacity: ${Math.random() * 0.05 + 0.05};
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 15}s infinite ease-in-out;
            animation-delay: ${Math.random() * -20}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return '$' + Math.round(amount).toLocaleString();
}

// Debounce function for performance
function debounce(func, wait) {
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Optimize scroll events
const optimizedScroll = throttle(() => {
    // Handle scroll-based animations here
}, 100);

window.addEventListener('scroll', optimizedScroll);

// Lazy load images (if you add actual images later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// ADDITIONAL INTERACTIVE FEATURES
// ============================================

// Add hover effect to service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Add glow effect to buttons on hover
document.addEventListener('DOMContentLoaded', () => {
    const glowButtons = document.querySelectorAll('.btn-primary.glow');

    glowButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 50px rgba(29, 78, 216, 0.7)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'var(--glow-shadow)';
        });
    });
});

// Console log for debugging
console.log('%c🏠 Elite Roofing Website Loaded Successfully! 🏠', 'color: #1D4ED8; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with premium design and modern interactions', 'color: #38BDF8; font-size: 14px;');

// Export functions for global access
window.resetBookingForm = resetBookingForm;

// ============================================
// ANALYTICS & TRACKING (PLACEHOLDER)
// ============================================

// Track calculator usage
function trackCalculatorUsage() {
    // Add your analytics code here
    // Example: gtag('event', 'calculator_use', {...});
    console.log('Calculator interaction tracked');
}

// Track form submissions
function trackFormSubmission(formType) {
    // Add your analytics code here
    // Example: gtag('event', 'form_submission', {form_type: formType});
    console.log(`Form submission tracked: ${formType}`);
}

// Track button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        console.log(`Button clicked: ${buttonText}`);
        // Add analytics tracking here
    });
});
