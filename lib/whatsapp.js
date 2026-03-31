const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends a WhatsApp message with the QR code image attached.
 * @param {string} toPhone  - Fan's phone number (e.g. "+2207001234")
 * @param {object} event    - Event object from DB
 * @param {string} qrImageUrl - Public URL to the QR code PNG
 */
async function sendTicketWhatsApp(toPhone, event, qrImageUrl) {
  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const body = `🎟 Your ticket is confirmed!\n\n*${event.event_name}* — ${eventDate} at *${event.venue}*.\n\nShow the QR code below at the door. See you there! 🎶`;

  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"
  const to = `whatsapp:${toPhone}`;

  await client.messages.create({
    from,
    to,
    body,
    mediaUrl: [qrImageUrl]
  });
}

module.exports = { sendTicketWhatsApp };
