# WaveTickets 🎟

Gambia's concert ticketing platform. Buy tickets via Wave Mobile Money, receive QR code on WhatsApp, scan at the door.

---

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Payments**: Wave Mobile Money API
- **Notifications**: Twilio WhatsApp API
- **QR Codes**: `qrcode` npm package + Supabase Storage
- **Deployment**: Railway

---

## Local Setup

### 1. Clone and install

```bash
cd wavetickets
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Set up Supabase

Run the SQL below in your Supabase SQL editor (Dashboard → SQL Editor).

### 4. Create Supabase Storage bucket

1. Go to Supabase → Storage
2. Create a new bucket named **`tickets`**
3. Set it to **Public** (so QR image URLs are accessible)

### 5. Run locally

```bash
npm run dev     # development (nodemon)
npm start       # production
```

Open `http://localhost:3000`

---

## Database Schema

Run this SQL in Supabase → SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Artists table
CREATE TABLE artists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  wave_api_key  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id         UUID REFERENCES artists(id) ON DELETE SET NULL,
  artist_name       TEXT NOT NULL,
  event_name        TEXT NOT NULL,
  date              TIMESTAMPTZ NOT NULL,
  venue             TEXT NOT NULL,
  ticket_price_gmd  NUMERIC(10,2) NOT NULL,
  total_tickets     INTEGER NOT NULL,
  tickets_sold      INTEGER NOT NULL DEFAULT 0,
  cover_image_url   TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Tickets table
CREATE TABLE tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID REFERENCES events(id) ON DELETE CASCADE,
  fan_name         TEXT NOT NULL,
  fan_phone        TEXT NOT NULL,
  qr_code_id       UUID,
  qr_code_image_url TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'valid', 'used')),
  transaction_id   TEXT,
  wave_session_id  TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_tickets_event_id       ON tickets(event_id);
CREATE INDEX idx_tickets_wave_session_id ON tickets(wave_session_id);
CREATE INDEX idx_tickets_qr_code_id     ON tickets(qr_code_id);
CREATE INDEX idx_events_artist_id       ON events(artist_id);
```

### Row Level Security (RLS)

The backend uses the **service key** so it bypasses RLS. You can optionally enable RLS for safety — the service key always has full access.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (Railway sets this automatically) |
| `NODE_ENV` | `development` or `production` |
| `BASE_URL` | Your full public URL (e.g. `https://myapp.railway.app`) — used for Wave success_url |
| `SESSION_SECRET` | Long random string for signing sessions |
| `WAVE_API_KEY` | Wave API key from your Wave developer account |
| `WAVE_WEBHOOK_SECRET` | Webhook signing secret from Wave dashboard |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (full DB access) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_WHATSAPP_FROM` | WhatsApp sender (e.g. `whatsapp:+14155238886`) |

---

## Pages

| Route | Description |
|---|---|
| `/` | Home / landing page |
| `/events/:id` | Public event page with Buy Ticket flow |
| `/success?session_id=...` | Post-payment confirmation with QR display |
| `/error` | Payment failed page |
| `/login` | Artist login |
| `/dashboard/:artist_id` | Artist dashboard (auth required) |
| `/scan` | QR door scanner (auth required) |

### API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/tickets/initiate` | Start ticket purchase → redirect to Wave |
| GET | `/api/ticket/by-session/:id` | Poll for QR after payment |
| POST | `/webhook/wave` | Wave payment webhook |
| POST | `/api/scan/validate` | Validate scanned QR code |
| POST | `/api/events` | Create event (artist auth) |
| POST | `/api/artists/register` | Register artist account |
| POST | `/login` | Artist login |
| POST | `/logout` | Artist logout |

---

## Railway Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial WaveTickets commit"
git remote add origin https://github.com/yourusername/wavetickets.git
git push -u origin main
```

### 2. Create Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. New Project → Deploy from GitHub repo → select your repo
3. Railway auto-detects Node.js and uses the `Procfile`

### 3. Add environment variables

In Railway → Variables, add all vars from `.env.example`

### 4. Set up Wave webhook

In your Wave developer dashboard, set the webhook URL to:
```
https://your-app.railway.app/webhook/wave
```

### 5. Domain

Railway provides a `.railway.app` domain. Set `BASE_URL` to this value.

---

## Creating Your First Artist Account

Hit this endpoint once with your admin credentials:

```bash
curl -X POST https://your-app.railway.app/api/artists/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Name","email":"you@example.com","password":"strongpassword"}'
```

Then log in at `/login`.

---

## Payment Flow

1. Fan visits `/events/:id`, fills in name + WhatsApp number
2. Backend creates a pending ticket and calls Wave Checkout API
3. Fan is redirected to Wave payment page
4. Fan pays in Wave app
5. Wave fires webhook to `/webhook/wave`
6. Backend verifies signature, generates UUID as QR code ID
7. QR PNG is generated and uploaded to Supabase Storage
8. Ticket is marked `valid` in DB
9. WhatsApp message sent to fan with QR image attached
10. Fan sees QR on `/success` page (polled via JS)

---

## License

MIT
