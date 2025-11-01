const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Default route placeholder
app.get('/', (_req, res) => {
  res.send('LegalView Node server is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
