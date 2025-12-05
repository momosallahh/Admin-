# GOVI.AI Backend

AI-powered government services assistant - Vercel serverless backend.

## 🚀 Features

- **WhatsApp Integration**: Process citizen messages via `/api/whatsapp`
- **AI Intent Classification**: Automatically detect passport renewal requests
- **Case Management**: Track and manage citizen service requests
- **Trello Integration**: Automatically create cards for new cases
- **REST API**: Full CRUD operations for cases

## 📁 Project Structure

```
/
├── api/
│   ├── health.js      # Health check endpoint
│   ├── whatsapp.js    # WhatsApp message handler
│   └── cases.js       # Case management CRUD
├── lib/
│   ├── ai.js          # Intent classification logic
│   ├── trello.js      # Trello integration
│   └── store.js       # In-memory data store
├── package.json
├── vercel.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
```bash
GET /api/health
```

### Process WhatsApp Message
```bash
POST /api/whatsapp
Content-Type: application/json

{
  "from_number": "+1234567890",
  "text": "I need to renew my passport",
  "language": "en"
}
```

### List All Cases
```bash
GET /api/cases
```

### Create New Case
```bash
POST /api/cases
Content-Type: application/json

{
  "citizen_id": "+1234567890",
  "service_type": "passport_renewal",
  "details": {...}
}
```

## 🚀 Deploy to Vercel

### Option 1: Import from GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Select branch: `claude/govi-ai-backend-01VWZhitjKuaLhJvDZfAg1X5`
5. Click "Deploy"

### Option 2: CLI Deployment

```bash
npm install -g vercel
vercel login
vercel --prod
```

## ⚙️ Environment Variables (Optional)

Configure in Vercel Dashboard for Trello integration:

- `TRELLO_KEY` - Your Trello API key
- `TRELLO_TOKEN` - Your Trello token
- `TRELLO_LIST_ID` - Target Trello list ID

Get these at: https://trello.com/app-key

## 🧪 Test Locally

```bash
node test-api.js
```

## 📝 Example Responses

### Passport Renewal Request

```json
{
  "reply": "It looks like you want to renew a passport...",
  "intent": "passport_renewal",
  "extracted": {
    "service_type": "passport_renewal",
    "fields_needed": ["full_name", "date_of_birth", ...]
  },
  "created_case_id": 1
}
```

### General Question

```json
{
  "reply": "Welcome to GOVI.AI. I can help with passport renewal...",
  "intent": "general_question",
  "extracted": {},
  "created_case_id": null
}
```

## 🔧 Technical Stack

- **Runtime**: Node.js 18+
- **Platform**: Vercel Serverless Functions
- **Storage**: In-memory (for demo - replace with database for production)
- **External APIs**: Trello (optional)

## 📞 Support

For issues or questions, contact the development team.
