require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Middleware
// Raw body for webhook signature verification MUST come before json parser
app.use('/webhook/wave', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'wavetickets-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const webhookRoutes = require('./routes/webhook');
const dashboardRoutes = require('./routes/dashboard');
const scanRoutes = require('./routes/scan');
const authRoutes = require('./routes/auth');

app.use('/', eventRoutes);
app.use('/', ticketRoutes);
app.use('/', webhookRoutes);
app.use('/', dashboardRoutes);
app.use('/', scanRoutes);
app.use('/', authRoutes);

// Success & error pages
app.get('/success', (req, res) => {
  const sessionId = req.query.session_id || '';
  res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'error.html'));
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WaveTickets running on port ${PORT}`);
});
