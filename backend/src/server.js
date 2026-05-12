require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');
const { pool } = require('./config/db');
const { srSchedulerJob } = require('./jobs/sr-scheduler.job');

const PORT = parseInt(process.env.PORT, 10) || 5000;

const start = async () => {
  try {
    // Verify DB connection on startup
    await pool.query('SELECT 1');
    logger.info('PostgreSQL connection verified ✓');

    const server = app.listen(PORT, () => {
      logger.info(`🧠 Brainiyo API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Start background jobs
    srSchedulerJob.start();
    logger.info('SR scheduler job started ✓');

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await pool.end();
        logger.info('PostgreSQL pool closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
};

start();
