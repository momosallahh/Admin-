# GOVI.AI

AI-powered government services assistant backend for Vercel.

## Endpoints

- `GET /api/health` - Health check
- `POST /api/whatsapp` - Process WhatsApp messages
- `GET /api/cases` - List all cases
- `POST /api/cases` - Create a new case

## Environment Variables

Set these in Vercel dashboard:

- `TRELLO_KEY` - Your Trello API key
- `TRELLO_TOKEN` - Your Trello token
- `TRELLO_LIST_ID` - Target Trello list ID

## Deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Local Development

```bash
npm install
npm run dev
```

## API Usage

### WhatsApp Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+1234567890",
    "text": "I need to renew my passport",
    "language": "en"
  }'
```

### Cases Endpoint

```bash
curl https://your-app.vercel.app/api/cases
```
