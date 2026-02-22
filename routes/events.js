const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const path = require('path');
const fs = require('fs');

// Home — redirect to a placeholder or list events
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});

// Public event page
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*, artists(name)')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).sendFile(path.join(__dirname, '..', 'views', '404.html'));
    }

    const ticketsRemaining = event.total_tickets - event.tickets_sold;
    const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Read the HTML template and inject data
    let html = fs.readFileSync(path.join(__dirname, '..', 'views', 'event.html'), 'utf8');
    html = html
      .replace(/{{EVENT_ID}}/g, event.id)
      .replace(/{{EVENT_NAME}}/g, escHtml(event.event_name))
      .replace(/{{ARTIST_NAME}}/g, escHtml(event.artist_name))
      .replace(/{{EVENT_DATE}}/g, escHtml(eventDate))
      .replace(/{{VENUE}}/g, escHtml(event.venue))
      .replace(/{{PRICE}}/g, Number(event.ticket_price_gmd).toLocaleString())
      .replace(/{{TICKETS_REMAINING}}/g, ticketsRemaining)
      .replace(/{{TOTAL_TICKETS}}/g, event.total_tickets)
      .replace(/{{COVER_IMAGE}}/g, event.cover_image_url || '/css/default-cover.jpg')
      .replace(/{{SOLD_OUT}}/g, ticketsRemaining <= 0 ? 'sold-out' : '')
      .replace(/{{BUY_DISABLED}}/g, ticketsRemaining <= 0 ? 'disabled' : '')
      .replace(/{{BUY_TEXT}}/g, ticketsRemaining <= 0 ? 'Sold Out' : 'Buy Ticket — D' + Number(event.ticket_price_gmd).toLocaleString());

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = router;
