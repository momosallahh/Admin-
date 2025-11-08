# 🚚 Moving Cost Calculator

A complete, embeddable moving cost calculator with lead generation, AI estimation, and webhook integrations.

## ✨ Features

### 🎯 **Two Calculation Modes**
- **Full Inventory Mode**: Select items from 8+ categories with 80+ items
- **AI Quick Estimate**: Type "I have a 2-bedroom apartment" and get instant estimates

### 💰 **Industry-Standard Pricing**
- Weight → cubic feet → truck size calculation
- Automatic crew sizing based on load
- Hourly labor rates with multipliers
- Distance-based pricing (local vs long-distance)
- Fuel surcharge, truck fees, start cost per mile
- Optional fees (stairs, packing, long carry, etc.)

### 📊 **Lead Capture Flow**
1. User completes calculation
2. **Show partial results** (teaser cost range)
3. Require email to see full breakdown
4. Display itemized costs + PDF download

### 🔗 **Integrations**
- Zapier webhooks
- Trello card creation
- HubSpot CRM
- Twilio SMS (optional)
- PDF export with jsPDF

### 🎨 **User Experience**
- Mobile-first responsive design
- Dark mode toggle
- Progress indicator
- Loading states
- Real-time inventory updates

---

## 🚀 Quick Start

### 1. **Deploy to Netlify** (Recommended)

```bash
# Already configured with netlify.toml
# Just connect your repo to Netlify
```

1. Go to https://app.netlify.com/start
2. Connect to GitHub
3. Select this repository
4. Click "Deploy site"

Done! Your calculator will be live at `https://your-site.netlify.app/calculator.html`

### 2. **Run Locally**

```bash
# Start a local server
python3 -m http.server 8000

# Or with Node.js
npx http-server

# Open browser
open http://localhost:8000/calculator.html
```

### 3. **Embed on Your Website**

```html
<!-- Option 1: iframe (easiest) -->
<iframe
    src="https://your-site.netlify.app/calculator.html"
    width="100%"
    height="1200px"
    frameborder="0">
</iframe>

<!-- Option 2: Direct link -->
<a href="https://your-site.netlify.app/calculator.html" target="_blank">
    Get Moving Quote
</a>
```

---

## ⚙️ Configuration

### Customize Pricing (`config.json`)

All pricing is controlled in `config.json`. Edit these values:

```json
{
  "pricing": {
    "labor": {
      "hourly_rate_per_mover": 45,    // Change hourly rate
      "minimum_hours": 2,
      "overtime_rate_multiplier": 1.5
    },

    "fees": {
      "fuel_surcharge_per_mile": 2.00,           // ✅ Your fuel fee
      "truck_equipment_fee": 150,                 // ✅ Your equipment fee
      "start_cost_per_mile": 5.00,               // ✅ First 10 miles
      "start_cost_applies_to_first_miles": 10,
      "regular_cost_per_mile_after_start": 2.50  // ✅ After 10 miles
    },

    "trucks": {
      "16ft": {
        "max_cubic_feet": 800,
        "daily_rate": 129    // Truck rental cost
      }
    }
  }
}
```

### Common Customizations

**Change Hourly Rate:**
```json
"hourly_rate_per_mover": 50  // Was 45
```

**Adjust Fuel Surcharge:**
```json
"fuel_surcharge_per_mile": 2.50  // Was 2.00
```

**Modify Truck Fees:**
```json
"truck_equipment_fee": 200  // Was 150
```

**Change Distance Pricing:**
```json
"start_cost_per_mile": 6.00,              // First X miles
"start_cost_applies_to_first_miles": 15,  // How many miles
"regular_cost_per_mile_after_start": 3.00 // After X miles
```

---

## 📦 Add/Edit Inventory Items

Edit `inventory.json` to add items:

```json
{
  "categories": {
    "living_room": {
      "name": "Living Room",
      "items": {
        "new_item": {
          "name": "Gaming Chair",
          "weight": 75,
          "icon": "🪑"
        }
      }
    }
  }
}
```

**Weight Guidelines:**
- Small box: 30 lbs
- Medium box: 45 lbs
- Sofa: 350 lbs
- Mattress: 150 lbs
- Refrigerator: 300 lbs

---

## 🔗 Webhook Setup

### Zapier Integration

1. Create a Zap at https://zapier.com
2. Choose trigger: **Webhooks by Zapier** → **Catch Hook**
3. Copy the webhook URL
4. Update `config.json`:

```json
{
  "integrations": {
    "webhook": {
      "enabled": true,
      "url": "https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_KEY"
    }
  }
}
```

5. Test by submitting a quote

**Webhook Payload:**
```json
{
  "timestamp": "2024-11-08T...",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234"
  },
  "move_details": {
    "distance_miles": 20,
    "cubic_feet": 750,
    "total_weight": 5250,
    "truck_size": "16 ft",
    "crew_size": 2,
    "labor_hours": "6.5"
  },
  "cost_breakdown": {
    "labor": 520,
    "truck": 129,
    "truck_equipment": 150,
    "fuel_surcharge": 40,
    "distance_fee": 87,
    "total_low": 833,
    "total_high": 1065
  }
}
```

### Trello Integration

```json
{
  "integrations": {
    "trello": {
      "enabled": true,
      "api_key": "YOUR_API_KEY",
      "token": "YOUR_TOKEN",
      "board_id": "YOUR_BOARD_ID",
      "list_id": "YOUR_LIST_ID"
    }
  }
}
```

Get credentials: https://trello.com/app-key

### HubSpot Integration

```json
{
  "integrations": {
    "hubspot": {
      "enabled": true,
      "api_key": "YOUR_HUBSPOT_API_KEY"
    }
  }
}
```

---

## 💬 SMS Integration (Optional)

Enable "Text me this quote" button:

```json
{
  "integrations": {
    "sms": {
      "enabled": true,
      "twilio_account_sid": "YOUR_SID",
      "twilio_auth_token": "YOUR_TOKEN",
      "twilio_phone_number": "+15551234567"
    }
  }
}
```

Requires Twilio account: https://www.twilio.com

---

## 🎨 Branding Customization

### Change Colors

Edit `config.json`:

```json
{
  "ui_settings": {
    "theme": {
      "primary_color": "#FF6B35",      // Your brand color
      "secondary_color": "#10b981",
      "default_dark_mode": false
    },
    "branding": {
      "show_powered_by": false,        // Hide "Powered by RoutineMoves"
      "custom_footer_text": "© 2024 Your Company"
    }
  }
}
```

### Change Company Info

```json
{
  "company": {
    "name": "ABC Moving Company",
    "phone": "(555) 123-4567",
    "email": "quotes@abcmoving.com",
    "website": "https://abcmoving.com",
    "logo_url": "https://your-site.com/logo.png"
  }
}
```

---

## 🔒 Admin Mode

Test pricing without lead capture:

1. Add `?admin=true` to URL:
   ```
   https://your-site.com/calculator.html?admin=true
   ```

2. Enter password (default: `admin123`)

3. Calculate quotes without forms or webhooks

**Change Admin Password:**
```json
{
  "admin_mode": {
    "enabled": true,
    "password": "your_secure_password"
  }
}
```

---

## 📊 Calculation Logic

### Weight → Cubic Feet
```
cubic_feet = total_weight / 7
```

### Truck Size Selection
- 0-400 cu ft → 10ft truck
- 401-800 cu ft → 16ft truck
- 801-1000 cu ft → 20ft truck
- 1001+ cu ft → 26ft truck

### Labor Time
```
load_time = weight / (1000 lbs/hr × movers)
unload_time = weight / (1200 lbs/hr × movers)
drive_time = distance / 45 mph
total_hours = load + unload + drive
```

### Cost Breakdown
```
labor_cost = hours × movers × hourly_rate
truck_fee = daily_rate (from config)
equipment_fee = $150 (configurable)
fuel_surcharge = distance × $2/mile
distance_fee = (first 10mi × $5) + (remaining × $2.50)
optional_fees = stairs + packing + long_carry

total = labor + truck + equipment + fuel + distance + optional

low_estimate = total × 0.90
high_estimate = total × 1.15
```

### Multipliers
- **Stairs**: +15% time per flight
- **Packing**: +30% time
- **Fragile items**: +20% time

---

## 🧪 Testing Scenarios

### Test Case 1: Studio Apartment (Local)
- AI Input: "Studio apartment, 5 miles"
- Expected: ~2,000 lbs, 10ft truck, 2 movers, 3-4 hours
- Cost: $600-800

### Test Case 2: 2BR House (Medium)
- Inventory: Queen bed, sofa, dining table, 30 boxes
- Distance: 20 miles
- Expected: ~5,500 lbs, 16ft truck, 3 movers, 6 hours
- Cost: $1,200-1,500

### Test Case 3: 4BR House (Large)
- AI Input: "4 bedroom house, 3rd floor, 50 miles"
- Expected: ~10,500 lbs, 26ft truck, 5 movers, 10 hours
- Cost: $2,800-3,500

---

## 🐛 Troubleshooting

### Calculator Not Loading
1. Check browser console for errors (F12)
2. Verify `inventory.json` and `config.json` are valid JSON
3. Test JSON files at https://jsonlint.com

### Webhook Not Firing
1. Check `config.json` → `integrations.webhook.enabled = true`
2. Verify webhook URL is correct
3. Check browser console for network errors
4. Test webhook at https://webhook.site

### Prices Seem Wrong
1. Verify hourly rate in `config.json`
2. Check truck fees
3. Review distance pricing (start cost vs regular)
4. Test in admin mode to see raw calculations

### PDF Not Downloading
1. Ensure jsPDF CDN is loading (check console)
2. Try different browser
3. Check popup blocker settings

---

## 📁 File Structure

```
moving-cost-calculator/
├── calculator.html          # Main calculator interface
├── calculator-styles.css    # Responsive CSS with dark mode
├── calculator-script.js     # All calculation logic
├── inventory.json           # 80+ items with weights
├── config.json              # Pricing rules & settings
├── CALCULATOR-README.md     # This file
└── netlify.toml             # Deployment config
```

---

## 🔄 Updates & Maintenance

### Update Item Weights
Edit `inventory.json` → find item → change `weight` value

### Change Pricing
Edit `config.json` → modify values → refresh page

### Add New Category
```json
{
  "categories": {
    "garage": {
      "name": "Garage Items",
      "items": {
        "toolbox": { "name": "Toolbox", "weight": 50, "icon": "🧰" }
      }
    }
  }
}
```

---

## 🚀 Advanced Features

### Multi-Language Support
Add translations in `config.json` and update HTML text

### Custom Multipliers
Edit `inventory.json`:
```json
{
  "multipliers": {
    "stairs_per_floor": 1.20,     // 20% instead of 15%
    "packing_required": 1.40      // 40% instead of 30%
  }
}
```

### ZIP Code Distance Calculation
Integrate with Google Maps API or similar service

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review browser console (F12)
3. Test in admin mode
4. Verify JSON file syntax

---

## 📄 License

This calculator is provided as-is for use by moving companies. Customize freely for your business needs.

---

## 🎉 You're All Set!

Your moving cost calculator is ready to generate leads. Customize pricing, connect webhooks, and start capturing customers!

**Quick Links:**
- 🔧 Edit Pricing: `config.json`
- 📦 Edit Items: `inventory.json`
- 🎨 Change Colors: `config.json` → `ui_settings.theme`
- 🔗 Add Webhook: `config.json` → `integrations.webhook`

---

**Built with ❤️ for Moving Companies**

Powered by [RoutineMoves](https://routinemoves.ai) - AI automation for moving businesses
