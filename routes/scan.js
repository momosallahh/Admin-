const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const path = require('path');

// GET /scan — scanner page (artist must be logged in)
router.get('/scan', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'scanner.html'));
});

// POST /api/scan/validate — validate a scanned QR code
router.post('/api/scan/validate', requireAuth, async (req, res) => {
  try {
    const { qr_code_id } = req.body;

    if (!qr_code_id) {
      return res.status(400).json({ valid: false, message: 'No QR code provided' });
    }

    // Fetch ticket by qr_code_id
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('qr_code_id', qr_code_id)
      .single();

    if (error || !ticket) {
      return res.json({
        valid: false,
        reason: 'not_found',
        message: 'Ticket not found'
      });
    }

    // Check artist owns this event (security: artists can only scan their own events)
    if (ticket.events?.artist_id !== req.session.artistId) {
      return res.json({
        valid: false,
        reason: 'unauthorized',
        message: 'This ticket is not for your event'
      });
    }

    if (ticket.status === 'used') {
      return res.json({
        valid: false,
        reason: 'already_used',
        message: 'Ticket already used',
        fan_name: ticket.fan_name
      });
    }

    if (ticket.status !== 'valid') {
      return res.json({
        valid: false,
        reason: 'invalid_status',
        message: 'Ticket is not valid'
      });
    }

    // Mark as used
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'used' })
      .eq('id', ticket.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return res.json({
      valid: true,
      message: 'Welcome!',
      fan_name: ticket.fan_name,
      event_name: ticket.events?.event_name
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ valid: false, message: 'Server error during validation' });
  }
});

module.exports = router;
