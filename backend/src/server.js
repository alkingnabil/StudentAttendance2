const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDatabase } = require('./config/database');
const { port, frontendOrigin, seedDemo } = require('./config/env');
const { seed } = require('./services/seed');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: frontendOrigin === '*' ? true : frontendOrigin, credentials: false }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true, service: 'tadreebi-backend', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/evaluations', require('./routes/evaluation.routes'));
app.use('/api/import', require('./routes/import.routes'));
app.use('/api/export', require('./routes/export.routes'));
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  if (seedDemo) await seed();
  app.listen(port, '0.0.0.0', () => console.log(`Tadreebi API listening on ${port}`));
}

if (require.main === module) {
  start().catch((err) => { console.error('Startup failed:', err); process.exit(1); });
}

module.exports = { app, start };
