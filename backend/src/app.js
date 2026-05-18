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
const { pool }         = require('./config/db');

// Route modules
const authRoutes         = require('./modules/auth/auth.routes');
const curriculumRoutes   = require('./modules/curriculum/curriculum.routes');
const analyticsRoutes    = require('./modules/analytics/analytics.routes');
const questionsRoutes    = require('./modules/questions/questions.routes');
const mocktestRoutes     = require('./modules/mock-tests/mock-tests.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const bookmarkRoutes     = require('./modules/bookmarks/bookmarks.routes');
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
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:8080,http://localhost:8081,http://localhost:5173,https://brainiyo-student.vercel.app,https://brainiyo-admin.vercel.app,https://brainiyo.vercel.app')
    .split(',')
    .filter(Boolean)
    .map(o => o.trim()),
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
app.get('/health', async (req, res) => {
  const dbStatus    = await pool.query('SELECT 1').then(() => 'up').catch(() => 'down');
  const redisStatus = require('./config/redis').status === 'ready' ? 'up' : 'down';
  
  // Redis is optional due to the safe memory fallback in config/redis.js,
  // so the service is fully operational as long as the PostgreSQL database is up.
  const isHealthy = dbStatus === 'up';
  
  res.status(isHealthy ? 200 : 503).json({
    status: (dbStatus === 'up' && redisStatus === 'up') ? 'ok' : (dbStatus === 'up' ? 'degraded' : 'down'),
    checks: { database: dbStatus, redis: redisStatus },
    env:    process.env.NODE_ENV,
    ts:     new Date().toISOString()
  });
});

app.get('/api/health/deep', async (req, res) => {
  const start = Date.now();
  const dbStart = Date.now();
  const dbCheck = await pool.query('SELECT 1').then(() => Date.now() - dbStart).catch(() => -1);
  
  const redisStart = Date.now();
  const isRedisUp = require('./config/redis').status === 'ready';
  const redisCheck = isRedisUp ? Date.now() - redisStart : -1;
  
  res.json({
    status: (dbCheck > 0 && redisCheck > 0) ? 'optimal' : 'degraded',
    latency: {
      total: Date.now() - start,
      database: dbCheck,
      redis: redisCheck
    },
    version: require('../package.json').version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: process.version
  });
});

// ── Rate limiter ─────────────────────────────────────────────────────
app.use(API, rateLimiter);

// ── Routes ────────────────────────────────────────────────────────────
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/content`,       curriculumRoutes);
app.use(`${API}/curriculum`,    curriculumRoutes);
app.use(`${API}/questions`,     questionsRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);
app.use(`${API}/mock-tests`,    mocktestRoutes);
app.use(`${API}/bookmarks`,     bookmarkRoutes);
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
