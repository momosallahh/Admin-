# Elite Roofing Website - Premium Design

A complete, modern, high-converting roofing company website built with HTML, CSS, and vanilla JavaScript. Features a stunning dark theme with neon accents, smooth animations, and a fully functional roofing cost calculator.

## Features

### 🎨 Design
- **Premium Dark Theme** - Modern dark background (#0B0F1A) with neon blue accents
- **Smooth Animations** - Fade-up animations, hover effects, and micro-interactions
- **Glassmorphic Effects** - Backdrop blur and transparent overlays
- **Fully Responsive** - Works perfectly on desktop, tablet, and mobile

### 🏠 Sections

1. **Hero Section**
   - Full-width cinematic hero with animated headline
   - Two prominent CTAs: "Get Instant Quote" and "Book Free Roof Inspection"
   - Trust badges (5.0 Rating, Licensed & Insured, 1,200+ Clients)
   - Floating particle effects

2. **Social Proof**
   - Google 4.9/5.0 rating display
   - 3 trust badges (Licensed, Happy Homeowners, Years of Expertise)
   - Scrolling review carousel with 7 customer testimonials

3. **Services Section**
   - 6 service cards with hover animations:
     - Roof Repair
     - Roof Replacement
     - Metal Roofing
     - Storm Damage Repair
     - Insurance Claims Support
     - Commercial Roofing

4. **Interactive Roofing Calculator**
   - **Roof Type Selection**: Shingle, Metal, Tile, Flat
   - **Roof Size Slider**: 500-5,000 sq ft
   - **Damage Level**: Minor, Moderate, Heavy
   - **Add-ons** (checkboxes):
     - Gutter Replacement (+$950)
     - Attic Insulation (+$600)
     - Roof Inspection Report PDF (+$85)
     - Fascia/Soffit Repairs (+$450)
   - Real-time price calculation with range display
   - Dynamic urgency tags based on damage level

5. **Before & After Gallery**
   - 6 interactive before/after sliders
   - Drag to compare transformations
   - Beautiful gradient placeholders (ready for real images)

6. **Service Area Map**
   - Interactive SVG map showing service areas
   - Hover effects with city names
   - Animated pulse effect on regions
   - Tooltip showing "Free Inspection Available"

7. **Booking Form**
   - Full contact form with validation
   - Fields: Name, Phone, Email, Preferred Date, Address, Description
   - Animated confirmation message on submit
   - Smooth scroll to form

8. **Footer**
   - Company info and logo
   - Contact details
   - Business hours
   - License information
   - Social media links
   - Copyright and links

9. **Floating Contact Bar**
   - Sticky bottom bar with 3 quick actions:
     - Call Now (tel: link)
     - Book Inspection (scrolls to form)
     - Text Us (sms: link)
   - Neon glow effect

## Calculator Pricing Logic

```javascript
Base Price: $3.50 per sq ft

Roof Type Multipliers:
- Shingle: 1.0x (baseline)
- Metal: +40% (1.4x)
- Tile: +60% (1.6x)
- Flat: -10% (0.9x)

Damage Multipliers:
- Minor: 1.0x (baseline)
- Moderate: +15% (1.15x)
- Heavy: +30% (1.3x)

Add-ons (fixed costs):
- Gutters: $950
- Insulation: $600
- PDF Report: $85
- Fascia/Soffit: $450

Final Price Range: Total ± 20%
```

## File Structure

```
/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles and animations
├── js/
│   └── script.js       # Calculator logic and interactions
├── img/                # Placeholder for images
└── assets/             # Placeholder for additional assets
```

## How to Use

1. **Open Locally**
   - Simply open `index.html` in any modern browser
   - No build process or dependencies required

2. **Customize Content**
   - Replace "Your City" with actual city name
   - Update phone numbers (555) 123-4567
   - Update email: info@eliteroofing.com
   - Update address and license numbers
   - Replace gradient placeholders with real before/after images

3. **Add Real Images**
   - Save images to `/img/` folder
   - Replace gradient backgrounds in gallery section
   - Add hero background video or image

4. **Deploy**
   - Upload all files to your web host
   - Works with any hosting: Netlify, Vercel, GitHub Pages, etc.

## Customization Guide

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --bg-dark: #0B0F1A;
    --neon-primary: #1D4ED8;
    --neon-secondary: #38BDF8;
    --light-text: #F8FAFC;
    --gray-text: #94A3B8;
}
```

### Calculator Pricing
Edit pricing constants in `script.js`:
```javascript
const PRICING = {
    basePrice: 3.50,  // Change base price per sq ft
    roofTypeMultipliers: { ... },
    damageMultipliers: { ... },
    addons: { ... }
};
```

### Font
Currently using Inter from Google Fonts. Change in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- Intersection Observer for scroll animations
- Throttled scroll events
- Debounced input handlers
- CSS transforms for smooth animations
- Minimal JavaScript, maximum performance

## Future Enhancements

1. Add real customer photos and project images
2. Integrate with backend for form submissions
3. Connect to payment processor
4. Add Google Maps integration
5. Implement analytics (Google Analytics, etc.)
6. Add live chat widget
7. Create admin dashboard for leads

## Credits

Built with modern web standards:
- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript (ES6+)
- No frameworks or libraries

---

**Made with ❤️ for Elite Roofing**

For support or customization requests, contact your developer.
