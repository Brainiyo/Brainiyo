require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const compression = require('compression');
const path        = require('path');

const logger           = require('./utils/logger');
const { rateLimiter }  = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes         = require('./modules/auth/auth.routes');
const contentRoutes      = require('./modules/curriculum/curriculum.routes');
const questionsRoutes    = require('./modules/questions/questions.routes');
const analyticsRoutes    = require('./modules/analytics/analytics.routes');
const mocktestRoutes     = require('./modules/mock-tests/mocktest.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const retentionRoutes    = require('./modules/retention/retention.controller');
const { initRetentionCron } = require('./modules/retention/cron');

const app = express();
const API = `/api`;

// ── Security ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.tailwindcss.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5002", "http://localhost:5000"]
    }
  }
}));
app.use(cors({
  origin:      (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  credentials: true,
}));

// ── Perf ─────────────────────────────────────────────────────────────
app.use(compression()); // gzip responses — critical for 2G/3G mobile

// ── Parsing ───────────────────────────────────────────────────────────
// Webhook needs raw body for HMAC verification
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '512kb' }));

// ── Logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Health ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

// ── Rate limiter ─────────────────────────────────────────────────────
app.use(API, rateLimiter);

// ── Routes ────────────────────────────────────────────────────────────
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/content`,       contentRoutes);
app.use(`${API}/questions`,     questionsRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);
app.use(`${API}/mock-tests`,    mocktestRoutes);
app.use(`${API}/subscriptions`, subscriptionRoutes);
app.use(`${API}/retention`,     retentionRoutes);

// Serve Student Portal
app.use('/student', express.static(path.join(__dirname, '../../student-web')));

// Initialize Cron Jobs (Retention & Notifications)
initRetentionCron();

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `${req.method} ${req.path} — endpoint not found`,
  });
});

// ── Global error handler (must be last) ──────────────────────────────
app.use(errorHandler);

module.exports = app;
