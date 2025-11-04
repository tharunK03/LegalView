const express = require('express');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;
const DEPLOY_COLOR = process.env.POD_COLOR || 'unknown';

// Prometheus metrics setup
promClient.collectDefaultMetrics();

// Custom metric: count root hits (example)
const httpRequestCounter = new promClient.Counter({
  name: 'legalview_http_requests_total',
  help: 'Total HTTP requests handled by route',
  labelNames: ['color', 'method', 'route', 'status']
});

// Record a zero-value sample so the metric appears even before traffic arrives
httpRequestCounter.labels(DEPLOY_COLOR, 'bootstrap', 'bootstrap', '0').inc(0);

// Middleware to track request counts
app.use((req, res, next) => {
  res.on('finish', () => {
    const statusCode = res.statusCode?.toString() || '0';
    httpRequestCounter.labels(DEPLOY_COLOR, req.method, req.route?.path || req.path, statusCode).inc();
  });
  next();
});

// Basic health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Default route placeholder
app.get('/', (_req, res) => {
  res.send('LegalView Node server is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
