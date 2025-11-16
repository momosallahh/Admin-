// ================================================
// ELITE ROOFING - INTERACTIVE JAVASCRIPT
// Premium $25k Agency-Quality Interactions
// ================================================

'use strict';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBeforeAfterSliders();
    initReviewsCarousel();
    initContactForm();
    initScrollAnimations();
    initParallax();
    initMapInteractions();
    initCalculator();
    initRoofingHelper();
    initWeatherTracker();
});

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const nav = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky navigation on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Animate toggle bars
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu on link click
    if (navToggle && navMenu) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');

                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // Smooth scroll for anchor links
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
// BEFORE/AFTER SLIDERS
// ============================================

function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.ba-slider');

    sliders.forEach(slider => {
        const container = slider.closest('.before-after');
        const afterImage = container.querySelector('.ba-after');
        const handle = container.querySelector('.ba-handle');

        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            afterImage.style.clipPath = `polygon(${value}% 0, 100% 0, 100% 100%, ${value}% 100%)`;
            handle.style.left = `${value}%`;
        });

        // Touch support for mobile
        let isSliding = false;

        container.addEventListener('mousedown', () => {
            isSliding = true;
        });

        container.addEventListener('mouseup', () => {
            isSliding = false;
        });

        container.addEventListener('mousemove', (e) => {
            if (isSliding) {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const percentage = (x / width) * 100;
                const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

                slider.value = clampedPercentage;
                afterImage.style.clipPath = `polygon(${clampedPercentage}% 0, 100% 0, 100% 100%, ${clampedPercentage}% 100%)`;
                handle.style.left = `${clampedPercentage}%`;
            }
        });

        // Touch events
        container.addEventListener('touchstart', () => {
            isSliding = true;
        });

        container.addEventListener('touchend', () => {
            isSliding = false;
        });

        container.addEventListener('touchmove', (e) => {
            if (isSliding) {
                const rect = container.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const width = rect.width;
                const percentage = (x / width) * 100;
                const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

                slider.value = clampedPercentage;
                afterImage.style.clipPath = `polygon(${clampedPercentage}% 0, 100% 0, 100% 100%, ${clampedPercentage}% 100%)`;
                handle.style.left = `${clampedPercentage}%`;
            }
        });
    });
}

// ============================================
// REVIEWS CAROUSEL
// ============================================

function initReviewsCarousel() {
    const track = document.querySelector('.reviews-track');

    if (!track) return;

    // Auto-scroll reviews
    let scrollPosition = 0;
    const cardWidth = 420; // card width + gap

    setInterval(() => {
        scrollPosition += cardWidth;

        // Reset when reaching end
        if (scrollPosition >= track.scrollWidth - track.clientWidth) {
            scrollPosition = 0;
        }

        track.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }, 5000);

    // Manual scroll tracking
    track.addEventListener('scroll', () => {
        scrollPosition = track.scrollLeft;
    });
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('contactSuccess');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value,
            address: document.getElementById('address').value,
            issue: document.getElementById('issue').value,
            timestamp: new Date().toISOString()
        };

        console.log('Form submitted:', formData);

        // Show success message with animation
        form.style.opacity = '0';
        form.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            form.style.display = 'none';
            successMessage.classList.add('show');
            successMessage.style.animation = 'fadeInUp 0.6s ease forwards';

            // Scroll to success message
            successMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);

        // Here you would normally send data to your backend
        // Example:
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // });
    });
}

// Reset form function (called from HTML)
function resetForm() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('contactSuccess');

    form.reset();
    form.style.display = 'block';
    form.style.opacity = '1';
    form.style.transform = 'translateY(0)';
    successMessage.classList.remove('show');

    form.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Make resetForm globally available
window.resetForm = resetForm;

// ============================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Add stagger effect for grid items
                if (entry.target.classList.contains('service-card') ||
                    entry.target.classList.contains('gallery-item') ||
                    entry.target.classList.contains('feature-card') ||
                    entry.target.classList.contains('trust-badge')) {

                    const index = Array.from(entry.target.parentElement.children).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.1}s`;
                }

                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const animateElements = document.querySelectorAll(`
        .service-card,
        .gallery-item,
        .feature-card,
        .trust-badge,
        .review-card,
        .about-content,
        .contact-form
    `);

    animateElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
}

// ============================================
// PARALLAX EFFECT
// ============================================

function initParallax() {
    const heroVideo = document.querySelector('.video-placeholder');

    if (!heroVideo) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;

        heroVideo.style.transform = `translate3d(0, ${rate}px, 0)`;
    });
}

// ============================================
// MAP INTERACTIONS
// ============================================

function initMapInteractions() {
    const regions = document.querySelectorAll('.map-region');

    regions.forEach(region => {
        region.addEventListener('mouseenter', function() {
            const city = this.getAttribute('data-city');
            console.log(`Hovering over ${city}`);

            // Add glow effect
            this.style.filter = 'drop-shadow(0 0 30px rgba(56, 189, 248, 1))';
        });

        region.addEventListener('mouseleave', function() {
            this.style.filter = '';
        });

        region.addEventListener('click', function() {
            const city = this.getAttribute('data-city');
            alert(`Free Inspection Available in ${city}!\n\nCall us at (555) 123-4567 to schedule.`);
        });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

// Optimize scroll event
const optimizedScroll = throttle(() => {
    // Additional scroll-based features can be added here
}, 100);

window.addEventListener('scroll', optimizedScroll);

// ============================================
// ADDITIONAL FEATURES
// ============================================

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth hover effect for glass cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Log when site is fully loaded
window.addEventListener('load', () => {
    console.log('%c🏠 Elite Roofing Website Loaded Successfully! 🏠',
        'color: #1D4ED8; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(29, 78, 216, 0.5);');
    console.log('%cPremium $25k Agency-Quality Design',
        'color: #38BDF8; font-size: 14px;');
});

// ============================================
// ANALYTICS TRACKING (Placeholder)
// ============================================

// Track button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        console.log(`Button clicked: ${buttonText}`);
        // Add your analytics code here
        // Example: gtag('event', 'button_click', { button_name: buttonText });
    });
});

// Track form interactions
const formInputs = document.querySelectorAll('input, textarea');
formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        console.log(`Form field focused: ${input.name || input.id}`);
        // Add analytics tracking here
    });
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', debounce(() => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    if (scrollPercent > maxScroll) {
        maxScroll = Math.floor(scrollPercent / 25) * 25; // Track in 25% increments
        console.log(`Scroll depth: ${maxScroll}%`);
        // Add analytics tracking here
    }
}, 500));

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.message);
    // You can send errors to your logging service here
});

// ============================================
// ANIMATED ROOFING HELPER
// ============================================

function initRoofingHelper() {
    const helper = document.getElementById('roofingHelper');
    const helperClose = document.getElementById('helperClose');
    const helperCharacter = helper.querySelector('.helper-character');
    const helperText = document.getElementById('helperText');

    if (!helper) return;

    // Messages that rotate
    const messages = [
        "Hey! Need help with your roof?",
        "Get an instant quote in 60 seconds!",
        "Free roof inspections - No obligation!",
        "We're Michigan's #1 roofing experts!",
        "24/7 emergency roof repairs available!"
    ];

    let messageIndex = 0;
    let messageInterval;

    // Show helper after 3 seconds
    setTimeout(() => {
        helper.classList.add('show');

        // Rotate messages every 5 seconds
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            helperText.textContent = messages[messageIndex];
        }, 5000);
    }, 3000);

    // Close helper (minimize to just character)
    helperClose.addEventListener('click', () => {
        helper.classList.add('minimized');
        clearInterval(messageInterval);
    });

    // Click character to expand again
    helperCharacter.addEventListener('click', () => {
        if (helper.classList.contains('minimized')) {
            helper.classList.remove('minimized');

            // Resume rotating messages
            messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                helperText.textContent = messages[messageIndex];
            }, 5000);
        }
    });

    // Hide helper on mobile if scrolled far
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768) {
            const currentScroll = window.pageYOffset;

            if (currentScroll > lastScroll && currentScroll > 500) {
                // Scrolling down - hide helper
                helper.style.opacity = '0.3';
            } else {
                // Scrolling up - show helper
                helper.style.opacity = '1';
            }

            lastScroll = currentScroll;
        }
    });
}

// ============================================
// ROOFING CALCULATOR
// ============================================

function initCalculator() {
    // Pricing constants
    const PRICING = {
        basePrice: 3.50, // per sq ft
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

    // Get all calculator inputs
    const roofTypeInputs = document.querySelectorAll('input[name="roofType"]');
    const roofSizeSlider = document.getElementById('roofSize');
    const roofSizeValue = document.getElementById('roofSizeValue');
    const damageLevelInputs = document.querySelectorAll('input[name="damageLevel"]');
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]');

    // Get output elements
    const priceValue = document.getElementById('priceValue');
    const urgencyBadge = document.getElementById('urgencyBadge');
    const breakdownItems = document.getElementById('breakdownItems');

    if (!roofSizeSlider || !priceValue) return;

    // Calculate and update price
    function calculatePrice() {
        // Get current values
        const roofType = document.querySelector('input[name="roofType"]:checked').value;
        const roofSize = parseInt(roofSizeSlider.value);
        const damageLevel = document.querySelector('input[name="damageLevel"]:checked').value;

        // Calculate base price
        let baseTotal = roofSize * PRICING.basePrice;

        // Apply roof type multiplier
        const roofMultiplier = PRICING.roofTypeMultipliers[roofType];
        baseTotal *= roofMultiplier;

        // Apply damage multiplier
        const damageMultiplier = PRICING.damageMultipliers[damageLevel];
        baseTotal *= damageMultiplier;

        // Calculate addons
        let addonsTotal = 0;
        const selectedAddons = [];

        addonCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const addonType = checkbox.value;
                const addonPrice = PRICING.addons[addonType];
                addonsTotal += addonPrice;

                // Get addon name from label
                const label = checkbox.parentElement.querySelector('.checkbox-label').textContent;
                selectedAddons.push({ name: label, price: addonPrice });
            }
        });

        // Calculate final total
        const total = baseTotal + addonsTotal;

        // Calculate price range (±20%)
        const minPrice = total * 0.8;
        const maxPrice = total * 1.2;

        // Update price display
        priceValue.textContent = `$${Math.round(minPrice).toLocaleString()} - $${Math.round(maxPrice).toLocaleString()}`;

        // Update urgency badge
        urgencyBadge.className = 'urgency-badge';
        if (damageLevel === 'minor') {
            urgencyBadge.textContent = '✓ Standard Timeline';
        } else if (damageLevel === 'moderate') {
            urgencyBadge.textContent = '⚡ Priority Service Recommended';
            urgencyBadge.classList.add('moderate');
        } else {
            urgencyBadge.textContent = '🚨 Emergency Service Required';
            urgencyBadge.classList.add('heavy');
        }

        // Update breakdown
        let breakdownHTML = '';

        // Roof type and size
        breakdownHTML += `
            <div class="breakdown-item">
                <span class="breakdown-label">${roofSize} sq ft ${roofType.charAt(0).toUpperCase() + roofType.slice(1)} Roof</span>
                <span class="breakdown-value">$${Math.round(baseTotal).toLocaleString()}</span>
            </div>
        `;

        // Damage level
        if (damageLevel !== 'minor') {
            breakdownHTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${damageLevel.charAt(0).toUpperCase() + damageLevel.slice(1)} Damage (+${Math.round((damageMultiplier - 1) * 100)}%)</span>
                    <span class="breakdown-value">Included</span>
                </div>
            `;
        }

        // Addons
        selectedAddons.forEach(addon => {
            breakdownHTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${addon.name}</span>
                    <span class="breakdown-value">+$${addon.price.toLocaleString()}</span>
                </div>
            `;
        });

        breakdownItems.innerHTML = breakdownHTML;
    }

    // Update roof size display
    roofSizeSlider.addEventListener('input', (e) => {
        roofSizeValue.textContent = e.target.value;
        calculatePrice();
    });

    // Add event listeners to all inputs
    roofTypeInputs.forEach(input => {
        input.addEventListener('change', calculatePrice);
    });

    damageLevelInputs.forEach(input => {
        input.addEventListener('change', calculatePrice);
    });

    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculatePrice);
    });

    // Initial calculation
    calculatePrice();
}

// ============================================
// WEATHER TRACKER
// ============================================

function initWeatherTracker() {
    const weatherGrid = document.getElementById('weatherGrid');
    const emergencyAlert = document.getElementById('emergencyAlert');

    if (!weatherGrid) return;

    // Michigan cities with coordinates
    const cities = [
        { name: 'Detroit', lat: 42.3314, lon: -83.0458 },
        { name: 'Grand Rapids', lat: 42.9634, lon: -85.6681 },
        { name: 'Ann Arbor', lat: 42.2808, lon: -83.7430 },
        { name: 'Lansing', lat: 42.7325, lon: -84.5555 },
        { name: 'Flint', lat: 43.0125, lon: -83.6875 },
        { name: 'Kalamazoo', lat: 42.2917, lon: -85.5872 },
        { name: 'Troy', lat: 42.6064, lon: -83.1498 },
        { name: 'Livonia', lat: 42.3684, lon: -83.3527 },
        { name: 'Sterling Heights', lat: 42.5803, lon: -83.0302 },
        { name: 'Warren', lat: 42.5145, lon: -83.0147 }
    ];

    // Weather icon mapping
    const weatherIcons = {
        0: '☀️',    // Clear sky
        1: '🌤️',    // Mainly clear
        2: '⛅',    // Partly cloudy
        3: '☁️',    // Overcast
        45: '🌫️',   // Fog
        48: '🌫️',   // Depositing rime fog
        51: '🌦️',   // Light drizzle
        53: '🌦️',   // Moderate drizzle
        55: '🌧️',   // Dense drizzle
        61: '🌧️',   // Slight rain
        63: '🌧️',   // Moderate rain
        65: '⛈️',   // Heavy rain
        71: '🌨️',   // Slight snow
        73: '🌨️',   // Moderate snow
        75: '❄️',    // Heavy snow
        77: '🌨️',   // Snow grains
        80: '🌦️',   // Slight rain showers
        81: '⛈️',   // Moderate rain showers
        82: '⛈️',   // Violent rain showers
        85: '🌨️',   // Slight snow showers
        86: '❄️',    // Heavy snow showers
        95: '⛈️',   // Thunderstorm
        96: '⛈️',   // Thunderstorm with hail
        99: '⛈️'    // Thunderstorm with heavy hail
    };

    // Severe weather codes that trigger emergency alert
    const severeWeatherCodes = [65, 82, 95, 96, 99];

    // Fetch weather for all cities
    async function fetchWeatherData() {
        try {
            const weatherPromises = cities.map(city =>
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Detroit`)
                    .then(res => res.json())
                    .then(data => ({
                        city: city.name,
                        ...data.current
                    }))
            );

            const weatherData = await Promise.all(weatherPromises);
            displayWeatherData(weatherData);
            checkForSevereWeather(weatherData);
        } catch (error) {
            console.error('Error fetching weather:', error);
            showWeatherError();
        }
    }

    // Display weather data in cards
    function displayWeatherData(weatherData) {
        weatherGrid.innerHTML = weatherData.map(weather => {
            const isSevere = severeWeatherCodes.includes(weather.weather_code);
            const icon = weatherIcons[weather.weather_code] || '🌡️';
            const condition = getWeatherCondition(weather.weather_code);

            return `
                <div class="weather-card glass-card ${isSevere ? 'storm-warning' : ''}">
                    <div class="weather-header">
                        <h3 class="weather-city">${weather.city}</h3>
                        <div class="weather-icon">${icon}</div>
                    </div>

                    <div class="weather-temp">${Math.round(weather.temperature_2m)}°F</div>
                    <div class="weather-condition">${condition}</div>

                    <div class="weather-details">
                        <div class="weather-detail">
                            <div class="weather-detail-icon">💨</div>
                            <div class="weather-detail-info">
                                <div class="weather-detail-label">Wind Speed</div>
                                <div class="weather-detail-value">${Math.round(weather.wind_speed_10m)} mph</div>
                            </div>
                        </div>

                        <div class="weather-detail">
                            <div class="weather-detail-icon">💧</div>
                            <div class="weather-detail-info">
                                <div class="weather-detail-label">Humidity</div>
                                <div class="weather-detail-value">${weather.relative_humidity_2m}%</div>
                            </div>
                        </div>
                    </div>

                    ${isSevere ? '<div class="storm-badge"><span class="storm-badge-icon">⚠️</span> Severe Weather Alert</div>' : ''}
                </div>
            `;
        }).join('');
    }

    // Check for severe weather and show emergency alert
    function checkForSevereWeather(weatherData) {
        const hasSevereWeather = weatherData.some(weather =>
            severeWeatherCodes.includes(weather.weather_code)
        );

        if (hasSevereWeather) {
            emergencyAlert.style.display = 'block';
        } else {
            emergencyAlert.style.display = 'none';
        }
    }

    // Get weather condition text
    function getWeatherCondition(code) {
        const conditions = {
            0: 'Clear Sky',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Dense Drizzle',
            61: 'Slight Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            71: 'Slight Snow',
            73: 'Moderate Snow',
            75: 'Heavy Snow',
            77: 'Snow Grains',
            80: 'Slight Rain Showers',
            81: 'Moderate Rain Showers',
            82: 'Violent Rain Showers',
            85: 'Slight Snow Showers',
            86: 'Heavy Snow Showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with Hail',
            99: 'Severe Thunderstorm'
        };
        return conditions[code] || 'Unknown';
    }

    // Show error message
    function showWeatherError() {
        weatherGrid.innerHTML = `
            <div class="weather-card glass-card">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <p style="color: rgba(255, 255, 255, 0.8);">Unable to load weather data. Please try again later.</p>
                </div>
            </div>
        `;
    }

    // Initial fetch
    fetchWeatherData();

    // Update weather every 10 minutes
    setInterval(fetchWeatherData, 600000);
}

// ============================================
// EXPORTS
// ============================================

// Export functions for use elsewhere if needed
window.EliteRoofing = {
    resetForm,
    // Add other functions you want to expose globally
};
