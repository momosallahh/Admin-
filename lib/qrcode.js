const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

/**
 * Generates a QR code PNG buffer for a given value,
 * uploads it to Supabase storage, and returns the public URL.
 */
async function generateAndUploadQR(qrCodeId) {
  // Generate PNG buffer
  const pngBuffer = await QRCode.toBuffer(qrCodeId, {
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  const fileName = `qrcodes/${qrCodeId}.png`;

  // Upload to Supabase Storage bucket "tickets"
  const { data, error } = await supabase.storage
    .from('tickets')
    .upload(fileName, pngBuffer, {
      contentType: 'image/png',
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('tickets')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

module.exports = { generateAndUploadQR };
