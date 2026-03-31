const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// POST /tickets/initiate — fan submits name + phone, create pending ticket, redirect to Wave
router.post('/tickets/initiate', async (req, res) => {
  try {
    const { event_id, fan_name, fan_phone } = req.body;

    if (!event_id || !fan_name || !fan_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize phone: ensure it starts with +
    const phone = fan_phone.startsWith('+') ? fan_phone : `+${fan_phone}`;

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check availability
    if (event.tickets_sold >= event.total_tickets) {
      return res.status(400).json({ error: 'Event is sold out' });
    }

    // Create a pending ticket (no qr_code_id yet — assigned after payment)
    const pendingId = uuidv4();
    const { error: insertError } = await supabase
      .from('tickets')
      .insert({
        id: pendingId,
        event_id,
        fan_name: fan_name.trim(),
        fan_phone: phone,
        status: 'pending'
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Create Wave checkout session
    const waveResponse = await fetch('https://api.wave.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: String(Math.round(event.ticket_price_gmd)),
        currency: 'GMD',
        success_url: `${process.env.BASE_URL || ''}/success?session_id={CHECKOUT_SESSION_ID}`,
        error_url: `${process.env.BASE_URL || ''}/error`,
        client_reference: pendingId
      })
    });

    if (!waveResponse.ok) {
      const errBody = await waveResponse.text();
      throw new Error(`Wave API error: ${errBody}`);
    }

    const waveData = await waveResponse.json();

    // Update ticket with wave session id
    await supabase
      .from('tickets')
      .update({ wave_session_id: waveData.id })
      .eq('id', pendingId);

    // Redirect fan to Wave payment page
    res.redirect(waveData.wave_launch_url);
  } catch (err) {
    console.error('Ticket initiation error:', err);
    res.redirect('/error?msg=' + encodeURIComponent(err.message));
  }
});

// GET /success — after Wave payment
router.get('/success', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'success.html'));
});

// GET /api/ticket/:sessionId — client polls for QR code after success
router.get('/api/ticket/by-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*, events(event_name, date, venue)')
      .eq('wave_session_id', sessionId)
      .eq('status', 'valid')
      .single();

    if (error || !ticket) {
      return res.status(404).json({ ready: false });
    }

    res.json({
      ready: true,
      fan_name: ticket.fan_name,
      qr_code_image_url: ticket.qr_code_image_url,
      event_name: ticket.events?.event_name,
      event_date: ticket.events?.date,
      venue: ticket.events?.venue
    });
  } catch (err) {
    res.status(500).json({ ready: false });
  }
});

module.exports = router;
