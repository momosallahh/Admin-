const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// GET /dashboard/:artist_id
router.get('/dashboard/:artist_id', requireAuth, async (req, res) => {
  try {
    const { artist_id } = req.params;

    // Artists can only view their own dashboard
    if (req.session.artistId !== artist_id) {
      return res.status(403).sendFile(path.join(__dirname, '..', 'views', '403.html'));
    }

    // Fetch artist
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, name, email')
      .eq('id', artist_id)
      .single();

    if (artistError || !artist) {
      return res.status(404).sendFile(path.join(__dirname, '..', 'views', '404.html'));
    }

    // Fetch events for this artist
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('artist_id', artist_id)
      .order('date', { ascending: false });

    // Fetch recent tickets for all artist events
    let tickets = [];
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      const { data: t } = await supabase
        .from('tickets')
        .select('id, fan_name, fan_phone, created_at, status, event_id, events(event_name)')
        .in('event_id', eventIds)
        .eq('status', 'valid')
        .order('created_at', { ascending: false })
        .limit(100);
      tickets = t || [];
    }

    // Build summary stats
    const totalSold = (events || []).reduce((sum, e) => sum + (e.tickets_sold || 0), 0);
    const totalRevenue = (events || []).reduce((sum, e) => sum + ((e.tickets_sold || 0) * e.ticket_price_gmd), 0);

    let html = fs.readFileSync(path.join(__dirname, '..', 'views', 'dashboard.html'), 'utf8');

    // Inject artist info
    html = html
      .replace(/{{ARTIST_NAME}}/g, escHtml(artist.name))
      .replace(/{{ARTIST_ID}}/g, artist.id)
      .replace(/{{TOTAL_SOLD}}/g, totalSold)
      .replace(/{{TOTAL_REVENUE}}/g, 'D' + Number(totalRevenue).toLocaleString());

    // Inject events rows
    const eventsHtml = (events || []).map(e => {
      const remaining = e.total_tickets - (e.tickets_sold || 0);
      const revenue = ((e.tickets_sold || 0) * e.ticket_price_gmd);
      const dateStr = new Date(e.date).toLocaleDateString('en-GB');
      return `
        <div class="event-card">
          <div class="event-card-header">
            <span class="event-title">${escHtml(e.event_name)}</span>
            <span class="event-date">${dateStr}</span>
          </div>
          <div class="event-stats">
            <div class="stat"><span class="stat-val">${e.tickets_sold || 0}/${e.total_tickets}</span><span class="stat-label">Tickets Sold</span></div>
            <div class="stat"><span class="stat-val">D${Number(revenue).toLocaleString()}</span><span class="stat-label">Revenue</span></div>
            <div class="stat"><span class="stat-val">${remaining}</span><span class="stat-label">Remaining</span></div>
          </div>
          <a href="/scan?event_id=${e.id}" class="btn-scanner">Open Scanner</a>
        </div>`;
    }).join('') || '<p class="no-data">No events yet.</p>';

    html = html.replace('{{EVENTS_HTML}}', eventsHtml);

    // Inject buyers table
    const buyersHtml = tickets.map(t => {
      const dateStr = new Date(t.created_at).toLocaleString('en-GB');
      return `
        <tr>
          <td>${escHtml(t.fan_name)}</td>
          <td>${escHtml(t.fan_phone)}</td>
          <td>${escHtml(t.events?.event_name || '')}</td>
          <td>${dateStr}</td>
          <td><span class="badge badge-${t.status}">${t.status}</span></td>
        </tr>`;
    }).join('') || '<tr><td colspan="5" class="no-data">No tickets sold yet.</td></tr>';

    html = html.replace('{{BUYERS_HTML}}', buyersHtml);

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /api/events — create event
router.post('/api/events', requireAuth, async (req, res) => {
  try {
    const {
      artist_name, event_name, date, venue,
      ticket_price_gmd, total_tickets, cover_image_url
    } = req.body;

    const { data, error } = await supabase
      .from('events')
      .insert({
        artist_id: req.session.artistId,
        artist_name: artist_name || req.session.artistName,
        event_name,
        date,
        venue,
        ticket_price_gmd: Number(ticket_price_gmd),
        total_tickets: Number(total_tickets),
        tickets_sold: 0,
        cover_image_url: cover_image_url || null
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ event: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = router;
