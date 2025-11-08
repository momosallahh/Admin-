# Moat Assessment - Enhanced Version 🏰

A comprehensive AI routines assessment tool for moving businesses with advanced features and user experience improvements.

## 🚀 What's New - Enhanced Features

### 1. **Navigation Improvements**
- ✅ **Back Button** - Users can now navigate to previous questions
- ✅ **Keyboard Navigation** - Complete keyboard support for better UX
  - `Enter`: Move to next question
  - `Backspace`: Go back to previous question
  - `1-4`: Select answer options quickly

### 2. **Progress Management**
- ✅ **Auto-Save** - Progress is automatically saved to browser localStorage
- ✅ **Resume Capability** - Users can resume incomplete assessments (valid for 7 days)
- ✅ **Restart Assessment** - Complete retake option with confirmation

### 3. **Enhanced User Experience**
- ✅ **Loading States** - Visual feedback during form submission
- ✅ **Email Validation** - Real-time email format validation with error messages
- ✅ **Success Messages** - Clear feedback for successful actions
- ✅ **Dynamic Spots Counter** - Realistic countdown that updates and persists daily

### 4. **Social Features**
- ✅ **Share on Twitter** - Share results with customized message
- ✅ **Share on LinkedIn** - Professional network sharing
- ✅ **Copy Link** - Easy link copying with visual feedback

### 5. **Technical Improvements**
- ✅ **Better Error Handling** - Graceful handling of webhook failures
- ✅ **Console Warnings** - Helpful warnings if webhook URL isn't configured
- ✅ **Mobile Responsive** - Significantly enhanced mobile experience
- ✅ **Accessibility** - ARIA labels for form inputs
- ✅ **Code Documentation** - Comprehensive inline comments

## 📋 Setup Instructions

### 1. Configure Webhook URL
Open `index.html` and find this line (around line 1571):
```javascript
const ZAPIER_WEBHOOK_URL = 'YOUR_ZAPIER_WEBHOOK_URL_HERE';
```
Replace with your actual Zapier webhook URL:
```javascript
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/';
```

### 2. Update Calendly Link (Optional)
If you have a different scheduling link, update this line (around line 1572):
```javascript
const CALENDLY_URL = 'https://calendly.com/routinemoves/strategy-call';
```

### 3. Test the Assessment
1. Open `index.html` in a web browser
2. Complete the assessment flow
3. Check browser console (F12) for any errors
4. Test all features:
   - Email submission
   - Back button navigation
   - Keyboard shortcuts
   - Progress saving (refresh page mid-assessment)
   - Share buttons
   - Restart functionality

## 🎯 Key Features Overview

### Landing Page
- Hero section with clear value proposition
- Social proof statistics
- Featured testimonial
- Urgency indicator (dynamic spots remaining)
- Email capture form with validation

### Quiz Flow
- 10 questions covering all routine categories
- Progress bar with motivational messages
- Visual feedback for selected options
- Back/Next navigation buttons
- Keyboard shortcuts support
- Auto-save progress

### Results Page
- Animated score circle with color coding
- Personalized routine recommendations (Critical/Recommended/Optional)
- Revenue impact calculator
- CTA for strategy call
- Share results options
- Restart assessment button

### Additional Features
- Exit intent popup (mouse leave detection)
- Social proof popups during quiz
- Mobile-optimized design
- localStorage for persistence
- Error handling and validation

## 🔧 Technical Details

### Data Persistence
- Assessment progress saved to `localStorage`
- Data expires after 7 days
- Cleared upon completion or manual restart
- Spots counter persists daily

### Webhook Payload Structure
```javascript
{
  firstName: "John",
  email: "john@example.com",
  score: 45,
  priority: "High",
  criticalRoutines: "Sales Routine, Dispatch Routine",
  recommendedRoutines: "Google Review Routine",
  optionalRoutines: "Mailing Routine",
  criticalCount: 2,
  recommendedCount: 1,
  monthlyLoss: 1300,
  annualLoss: 15600,
  answers: {...},
  status: "new",
  source: "Moat Assessment V2",
  timestamp: "2025-01-01T12:00:00.000Z"
}
```

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- Requires JavaScript enabled
- Uses localStorage API
- Uses Fetch API for webhook

## 📱 Mobile Optimizations

- Responsive grid layouts
- Touch-friendly buttons
- Optimized font sizes
- Stacked button layouts
- Full-width elements
- Improved spacing

## 🎨 Customization

### Colors
Primary gradient: `#667eea` to `#764ba2`
- Modify CSS variables at the top of `<style>` section
- Update button colors, backgrounds, borders

### Questions
- Edit question text and options in HTML
- Update `routines` object in JavaScript for metadata
- Adjust scoring in `data-points` attributes

### Routine Definitions
Update the `routines` object (around line 1580) to modify:
- Routine names
- Monthly costs
- Descriptions

## 🐛 Troubleshooting

### Webhook Not Working
- Check browser console for errors
- Verify webhook URL is correct
- Test webhook URL with Postman
- Check CORS settings if needed

### Progress Not Saving
- Check if localStorage is enabled
- Try in incognito mode (private browsing disables localStorage)
- Clear browser cache and try again

### Mobile Issues
- Test on actual devices, not just emulators
- Check viewport meta tag is present
- Verify CSS media queries are working

## 📊 Analytics Recommendations

Consider adding tracking for:
- Page views
- Email submissions
- Quiz completions
- Average score
- Drop-off points
- Share button clicks
- CTA conversions

## 🔒 Privacy & Data

- Email data sent to configured webhook only
- Progress stored locally in browser
- No cookies used
- GDPR compliant (with proper privacy policy)

## 📈 Performance

- Single HTML file (no dependencies)
- Optimized CSS animations
- Minimal JavaScript overhead
- Fast load times
- No external API calls except webhook

## 🚀 Deployment

### Option 1: Static Hosting
- Upload `index.html` to any web host
- Works with GitHub Pages, Netlify, Vercel, etc.
- No server-side code required

### Option 2: Custom Domain
- Point domain to hosting provider
- Update Open Graph meta tags with actual domain
- Update share URLs if needed

## 📝 License

This is a custom assessment tool. All rights reserved.

## 💡 Future Enhancements

Potential features to add:
- [ ] PDF export of results
- [ ] Email results to user
- [ ] Multi-language support
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Admin panel for viewing results
- [ ] Custom branding options
- [ ] Integration with CRM systems

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review this README thoroughly
3. Test in different browsers
4. Contact developer for assistance

---

**Version:** 2.0 (Enhanced)
**Last Updated:** 2025-01-08
**Tested On:** Chrome 120+, Firefox 120+, Safari 17+, Mobile Browsers
