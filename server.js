const express = require('express');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

// Prometheus metrics setup
promClient.collectDefaultMetrics();

// Custom metric: count root hits (example)
const httpRequestCounter = new promClient.Counter({
  name: 'legalview_http_requests_total',
  help: 'Total HTTP requests handled by route',
  labelNames: ['method', 'route', 'status']
});

// Middleware to track request counts
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
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
