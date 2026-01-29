/* =============================================
   MOE.LOCAL - Main Page Component
   =============================================

   EDIT YOUR LINKS HERE:
   =============================================
*/

// ========== CONFIGURE YOUR LINKS ==========
const LINKS = {
  calendly: 'https://calendly.com/YOUR-LINK',      // Your Calendly booking link
  instagram: 'https://instagram.com/moe.local',    // Your Instagram profile
  email: 'hello@moe.local',                        // Your contact email
}
// ==========================================

export default function Home() {
  return (
    <>
      {/* ========== NAVIGATION ========== */}
      <nav className="nav">
        <div className="nav-container">
          <a href="#" className="nav-brand">Moe.local</a>
          <div className="nav-links">
            <a href="#pilot" className="nav-link">90-Day Pilot</a>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Instagram
            </a>
            <a
              href={LINKS.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link nav-cta"
            >
              Book a coffee
            </a>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="hero">
        <div className="hero-container">
          <p className="hero-location">Northville &bull; Michigan</p>
          <h1 className="hero-headline">
            Helping local businesses get more customers.
          </h1>
          <p className="hero-subhead">
            Moe.local installs a simple local customer engine: short-form content
            that builds trust, targeted Facebook/Instagram ads that drive inquiries,
            and follow-up systems so leads turn into bookings.
          </p>
          <div className="hero-buttons">
            <a
              href={LINKS.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Book a coffee
            </a>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Follow @moe.local
            </a>
          </div>
          <div className="credibility-box">
            <p className="credibility-text">
              Partnering with the Northville Chamber of Commerce to cover events
              and spotlight the business community.
            </p>
          </div>
        </div>
      </section>

      {/* ========== WHAT WE DO SECTION ========== */}
      <section className="services">
        <div className="services-container">
          <h2 className="section-title">What we do</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🎬</div>
              <h3 className="service-title">Short-form content</h3>
              <p className="service-desc">
                Reels that build trust: owner intros, tours, testimonials,
                and service education.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">📍</div>
              <h3 className="service-title">Local ads</h3>
              <p className="service-desc">
                Northville-targeted FB/IG campaigns that drive inquiries
                for your best offers.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚙️</div>
              <h3 className="service-title">Systems &amp; follow-up</h3>
              <p className="service-desc">
                Simple funnels + automation so leads don&apos;t disappear
                and bookings increase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 90-DAY PILOT SECTION ========== */}
      <section className="pilot" id="pilot">
        <div className="pilot-container">
          <h2 className="pilot-title">The Northville 90-Day Growth Pilot</h2>
          <p className="pilot-intro">
            A focused sprint to install and validate a local customer engine.
            We test messaging, run ads, build follow-ups, and measure results.
            If it works, we scale. If not, you still keep the system.
          </p>
          <div className="pilot-grid">
            <div className="pilot-card">
              <p className="pilot-month">Month 1</p>
              <h3 className="pilot-phase">Foundation</h3>
              <ul className="pilot-list">
                <li>Offer + positioning cleanup</li>
                <li>Film day (content library)</li>
                <li>Ad + funnel setup</li>
              </ul>
            </div>
            <div className="pilot-card">
              <p className="pilot-month">Month 2</p>
              <h3 className="pilot-phase">Launch</h3>
              <ul className="pilot-list">
                <li>Ads live + weekly optimization</li>
                <li>Retargeting + new content drops</li>
                <li>Track inquiries, bookings, CPL</li>
              </ul>
            </div>
            <div className="pilot-card">
              <p className="pilot-month">Month 3</p>
              <h3 className="pilot-phase">Scale</h3>
              <ul className="pilot-list">
                <li>Double down on what works</li>
                <li>Testimonial capture</li>
                <li>90-day report + next-step roadmap</li>
              </ul>
            </div>
          </div>
          <div className="pilot-buttons">
            <a
              href={LINKS.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-light"
            >
              Book a coffee
            </a>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-light"
            >
              See the work on Instagram
            </a>
          </div>
          <p className="pilot-fit">
            <strong>Best fit:</strong> Med spas, dentists, gyms, home services,
            restaurants, and premium local shops.
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-brand">Moe.local</p>
          <p className="footer-location">
            Northville, MI &bull;{' '}
            <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
          </p>
          <div className="footer-links">
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Instagram
            </a>
            <a
              href={LINKS.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Book a coffee
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
