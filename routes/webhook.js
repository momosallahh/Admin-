const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../lib/supabase');
const { generateAndUploadQR } = require('../lib/qrcode');
const { sendTicketWhatsApp } = require('../lib/whatsapp');

// POST /webhook/wave — Wave payment webhook
// Body is raw buffer (set in server.js before json middleware)
router.post('/webhook/wave', async (req, res) => {
  try {
    const rawBody = req.body; // raw Buffer
    const signature = req.headers['wave-signature'];

    // Validate Wave webhook signature
    if (!validateWaveSignature(rawBody, signature)) {
      console.warn('Invalid Wave webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));

    if (event.type !== 'checkout.session.completed') {
      // Acknowledge other event types without processing
      return res.status(200).json({ received: true });
    }

    const session = event.data;
    const pendingTicketId = session.client_reference;

    if (!pendingTicketId) {
      console.warn('No client_reference in webhook payload');
      return res.status(200).json({ received: true });
    }

    // Fetch pending ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('id', pendingTicketId)
      .single();

    if (ticketError || !ticket) {
      console.error('Ticket not found for id:', pendingTicketId);
      return res.status(200).json({ received: true }); // don't fail webhook
    }

    // Idempotency: skip if already processed
    if (ticket.status === 'valid') {
      return res.status(200).json({ received: true });
    }

    // Generate unique QR code ID
    const qrCodeId = uuidv4();

    // Generate and upload QR code PNG
    let qrImageUrl;
    try {
      qrImageUrl = await generateAndUploadQR(qrCodeId);
    } catch (err) {
      console.error('QR generation failed:', err);
      return res.status(500).json({ error: 'QR generation failed' });
    }

    // Update ticket: set to valid, save qr_code_id, qr_code_image_url, transaction_id
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'valid',
        qr_code_id: qrCodeId,
        qr_code_image_url: qrImageUrl,
        transaction_id: session.transaction_id || session.id,
        wave_session_id: session.id
      })
      .eq('id', pendingTicketId);

    if (updateError) {
      console.error('Ticket update failed:', updateError);
      return res.status(500).json({ error: 'DB update failed' });
    }

    // Increment tickets_sold on event
    const { data: eventData } = await supabase
      .from('events')
      .select('tickets_sold')
      .eq('id', ticket.event_id)
      .single();

    await supabase
      .from('events')
      .update({ tickets_sold: (eventData?.tickets_sold || 0) + 1 })
      .eq('id', ticket.event_id);

    // Send WhatsApp ticket
    try {
      await sendTicketWhatsApp(ticket.fan_phone, ticket.events, qrImageUrl);
    } catch (err) {
      // Log but don't fail — ticket is already valid
      console.error('WhatsApp send failed:', err.message);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

function validateWaveSignature(rawBody, signature) {
  if (!signature || !process.env.WAVE_WEBHOOK_SECRET) return false;
  try {
    const expected = crypto
      .createHmac('sha256', process.env.WAVE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    // Wave sends "sha256=<hex>"
    const provided = signature.startsWith('sha256=')
      ? signature.slice(7)
      : signature;
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(provided, 'hex')
    );
  } catch {
    return false;
  }
}

module.exports = router;
