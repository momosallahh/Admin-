# 🚚 Super Moving Calculator

A premium, conversion-optimized moving cost estimator with AI-powered features, designed to help moving companies increase bookings and revenue with an Apple-level user experience.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features Overview

### 🎯 Core Features

1. **📅 Book Now & Call Office Integration**
   - Configurable booking link (Calendly, etc.)
   - Click-to-call phone integration
   - Dynamic urgency messaging for moves <10 days
   - Soft pulse animation on CTA buttons

2. **🧠 AI Summary Generator**
   - Professional, human-readable quote summaries
   - Considers distance, hours, crew size, and service tier
   - Automatically updates in real-time

3. **💰 Three-Tier Pricing System**
   - **Saver (85%)** - Budget-friendly basic service
   - **Standard (100%)** - Most popular, full-featured
   - **White Glove (135%)** - Premium concierge service
   - Feature comparison charts
   - Dynamic tier switching with live recalculation

4. **🤖 Auto-Inventory Input**
   - Smart inventory pre-fill based on home size (Studio to 4BR+)
   - Fully editable item lists
   - Real-time weight calculation

5. **⚠️ Move Risk Score Calculator**
   - Analyzes: weight, stairs, distance, item value
   - Three risk levels: Low ✅ | Medium ⚠️ | Complex 🔴
   - Intelligent tier recommendations

6. **📆 Crew Availability Calendar**
   - 14-day rolling availability view
   - Color-coded: Green (available) | Yellow (limited) | Red (full)
   - Click-to-select date integration

7. **💬 SMS Quote Delivery**
   - Text customers their full quote
   - Twilio-ready integration
   - Lead capture for follow-up automation

8. **💡 Smart Upsell Recommendation Engine**
   - Context-aware suggestions:
     - Extra mover (if weight >2200 lbs)
     - Packing service (if >50 items)
     - Full insurance (if value >$10k)
     - Storage (long-distance moves)
     - White Glove tier (high-risk moves)

9. **⚡ Dynamic Pricing Engine**
   - **+20%** Peak season (May–September)
   - **+15%** Weekends
   - **+25%** Month-end rush (last 3 days & 1st)
   - **+50%** Rush service (<3 days)
   - **+30%** Holidays
   - **+10%** Long-distance (>100 miles)
   - **+10%** Walk-up (no elevator)

10. **📦 Add-On Services**
    - Professional packing (per room)
    - Full value insurance (2% of item value)
    - Furniture assembly/disassembly
    - Post-move cleaning
    - Junk removal
    - Storage (first month free!)

11. **📸 Photo/Video Upload**
    - Drag-and-drop file upload
    - AI-powered inventory estimation
    - Supports images and videos

12. **💳 Competitor Comparison**
    - Shows industry average vs. your quote
    - Highlights savings (builds trust)

13. **🎁 Referral Program**
    - Auto-generated referral codes (REF-XXXXXX)
    - $100 off for both parties
    - Easy sharing via text/email/social

14. **🧾 Tip Calculator**
    - Quick-select: 15%, 18%, 20%
    - Custom tip input
    - Included in final total

15. **📥 Moving Checklist PDF**
    - Downloadable PDF checklist
    - Timeline: 4 weeks to moving day
    - Personalized with customer details

---

## 🏗️ Project Structure

```
/
├── calculator.html      # Main application HTML
├── styles.css          # Premium CSS styling (Apple-inspired)
├── app.js             # Full JavaScript application logic
├── config.json        # Easy configuration file
└── README.md          # This file
```

---

## 🚀 Quick Start

### 1. Installation

Simply open `calculator.html` in a modern web browser. No build process required!

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to directory
cd super-moving-calculator

# Open in browser
open calculator.html
```

### 2. Configuration

Edit `config.json` to customize for your moving company:

```json
{
  "company": {
    "name": "Your Moving Company",
    "phone": "+1-800-YOUR-MOVE",
    "email": "booking@yourcompany.com",
    "bookingUrl": "https://calendly.com/yourcompany/booking"
  },
  "pricing": {
    "baseHourlyRate": 120,
    "perMoverRate": 60,
    "mileageRate": 2.5
  }
}
```

### 3. Integration

**For Twilio SMS (Optional):**

To enable real SMS sending, add your Twilio credentials and endpoint:

```javascript
// In app.js, update handleSMSSubmit function
async function handleSMSSubmit(e) {
    e.preventDefault();

    const response = await fetch('YOUR_BACKEND_ENDPOINT/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: phone,
            message: generateSMSMessage()
        })
    });
}
```

---

## 💼 Pricing Logic

### Base Quote Formula

```
Base Price = (Labor Hours × Base Rate) + (Crew Size × Per Mover Rate × Hours) + (Miles × Mileage Rate)
```

**Example:**
- 4 hours labor × $120 = $480
- 3 movers × $60 × 4 hours = $720
- 25 miles × $2.50 = $62.50
- **Base Total: $1,262.50**

### Crew Size Calculation

| Weight Range | Crew Size |
|--------------|-----------|
| < 1,500 lbs  | 2 movers  |
| 1,500-3,000  | 3 movers  |
| 3,000-5,000  | 4 movers  |
| 5,000+       | 5 movers  |

### Estimated Hours

```
Hours = (Weight / 500) + (Distance / 10 × 0.5) + (Stairs ? 1 : 0)
Minimum: 3 hours
```

### Risk Score Algorithm

```javascript
Points = 0
if (weight > 7000) points += 2
if (weight > 4000) points += 1
if (distance > 200) points += 2
if (distance > 100) points += 1
if (hasStairs) points += 1
if (itemValue > 20000) points += 2
if (itemValue > 10000) points += 1

Risk Level:
- Low: 0-2 points
- Medium: 3-4 points
- High: 5+ points
```

---

## 🎨 Design System

### Color Palette

```css
Primary:    #0071e3 (Apple Blue)
Secondary:  #5e5ce6 (Purple)
Success:    #34c759 (Green)
Warning:    #ff9500 (Orange)
Danger:     #ff3b30 (Red)
```

### Typography

```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont
Weights: 300, 400, 500, 600, 700, 800
```

### Spacing Scale

```
XS:  0.5rem (8px)
SM:  0.75rem (12px)
MD:  1rem (16px)
LG:  1.5rem (24px)
XL:  2rem (32px)
2XL: 3rem (48px)
3XL: 4rem (64px)
```

---

## 📱 Responsive Design

The calculator is fully responsive and optimized for:

- **Desktop** (1400px+): Full two-column layout
- **Tablet** (768px-1024px): Stacked layout
- **Mobile** (320px-768px): Single column, optimized touch targets

---

## 🔧 Customization Guide

### Adding New Pricing Conditions

Edit `config.json`:

```json
{
  "pricing": {
    "seasonalMultipliers": {
      "newCondition": {
        "multiplier": 1.15,
        "label": "Your Custom Condition"
      }
    }
  }
}
```

Then update `applyPricingConditions()` in `app.js`.

### Adding New Add-Ons

1. Add to `config.json`:

```json
{
  "addOns": {
    "newService": 99
  }
}
```

2. Add HTML in `calculator.html`:

```html
<div class="addon-item">
    <label class="toggle-switch">
        <input type="checkbox" id="addonNewService">
        <span class="toggle-slider"></span>
    </label>
    <div class="addon-info">
        <h4>🆕 New Service</h4>
        <p>Description</p>
    </div>
    <div class="addon-price" id="newServicePrice">+$0</div>
</div>
```

3. Update `calculateAddOns()` in `app.js`.

### Customizing Home Size Templates

Edit `config.json`:

```json
{
  "inventory": {
    "5bedroom": {
      "beds": 5,
      "dressers": 5,
      "boxes": 90,
      "estimatedWeight": 9500
    }
  }
}
```

---

## 🔌 API Integration Points

### Backend Endpoints (Recommended)

```
POST /api/sms/send-quote
POST /api/leads/capture
POST /api/bookings/create
GET  /api/availability/check
POST /api/ai/estimate-from-image
```

### Example Lead Capture

```javascript
async function captureLead() {
    await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: state.customerName,
            phone: state.customerPhone,
            moveDate: state.moveDate,
            quote: calculationResults.finalPrice,
            tier: state.selectedTier
        })
    });
}
```

---

## 📊 Analytics & Tracking

### Recommended Events to Track

```javascript
// Add to your analytics platform

// Quote generated
trackEvent('quote_generated', {
    price: calculationResults.finalPrice,
    tier: state.selectedTier,
    homeSize: state.homeSize
});

// Tier changed
trackEvent('tier_changed', {
    from: oldTier,
    to: newTier
});

// Add-on selected
trackEvent('addon_selected', {
    addon: addonName,
    price: addonPrice
});

// Quote texted
trackEvent('quote_texted', {
    phone: customerPhone
});

// Booking clicked
trackEvent('booking_clicked', {
    price: calculationResults.finalPrice
});
```

---

## 🧪 Testing Checklist

- [ ] Test all tier selections update pricing
- [ ] Verify dynamic pricing conditions apply correctly
- [ ] Test add-ons toggle and calculate properly
- [ ] Upload photos/videos and check file size limits
- [ ] Test SMS modal form validation
- [ ] Verify calendar date selection updates urgency
- [ ] Test referral code copy and share
- [ ] Download PDF checklist
- [ ] Test on mobile devices (iOS/Android)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Verify all phone/email links work
- [ ] Test with various home sizes
- [ ] Verify risk score changes appropriately

---

## 🚀 Performance Optimizations

- ✅ Vanilla JavaScript (no framework overhead)
- ✅ Minimal external dependencies (only jsPDF)
- ✅ CSS-based animations (GPU accelerated)
- ✅ Debounced input handlers
- ✅ Lazy-loaded images
- ✅ Optimized for Core Web Vitals

---

## 🔐 Security Considerations

**Before deploying to production:**

1. **Sanitize all user inputs** (XSS prevention)
2. **Implement rate limiting** on SMS/email endpoints
3. **Add CAPTCHA** to prevent bot submissions
4. **Validate file uploads** (type, size, content)
5. **Use HTTPS** for all communications
6. **Implement CSRF tokens** for form submissions
7. **Secure API keys** (never expose in client-side code)

---

## 📈 Conversion Optimization Tips

1. **Urgency Messaging**: Enabled automatically for moves <10 days
2. **Social Proof**: Add customer testimonials above footer
3. **Exit Intent**: Consider exit-intent popup with discount
4. **A/B Testing**: Test different tier names and pricing
5. **Live Chat**: Add chat widget for instant questions
6. **Reviews**: Display Google/Yelp ratings near CTA
7. **Video**: Add explainer video in hero section
8. **Guarantees**: Highlight money-back or satisfaction guarantees

---

## 🛠️ Troubleshooting

### Prices not calculating?

Check browser console for JavaScript errors. Ensure `config.json` loaded successfully.

### SMS not sending?

SMS feature requires backend integration with Twilio. By default, it only logs to console.

### PDF not downloading?

Ensure jsPDF library is loaded from CDN. Check browser console for errors.

### Calendar not showing?

Verify JavaScript is enabled and no ad-blockers are interfering.

---

## 🌟 Future Enhancements

Potential features for v2.0:

- [ ] Multi-language support (i18n)
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Real-time chat support
- [ ] Video call booking
- [ ] AI chatbot for questions
- [ ] Stripe payment integration
- [ ] Email drip campaigns
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] SEO-optimized landing pages

---

## 📝 License

MIT License - feel free to customize and use for your moving company!

---

## 🤝 Support

For questions or customization requests:

- **Email**: support@yourdomain.com
- **Documentation**: [Link to docs]
- **Issue Tracker**: [GitHub Issues]

---

## 🎉 Credits

Built with:
- **Inter Font** by Rasmus Andersson
- **jsPDF** for PDF generation
- Inspired by Apple's design philosophy

---

**Made with ❤️ for the moving industry**

*Increase your bookings. Boost your revenue. Delight your customers.*
