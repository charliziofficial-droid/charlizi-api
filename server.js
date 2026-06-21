import express from 'express';
import cors from 'cors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple contact form endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, company, country, product, quantity, message } = req.body;

  // Validate required fields
  if (!name || !email || !product || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log the inquiry (in production, send email or store in DB)
  const timestamp = new Date().toISOString();
  const logEntry = `
=== NEW INQUIRY ===
Timestamp: ${timestamp}
Name: ${name}
Email: ${email}
Company: ${company || 'N/A'}
Country: ${country || 'N/A'}
Product: ${product}
Quantity: ${quantity || 'N/A'}
Message: ${message}
===================
`;

  // Append to log file
  const logDir = path.join(__dirname, 'data');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'inquiries.log');
  fs.appendFileSync(logFile, logEntry);

  console.log(`Inquiry received from ${name} <${email}>`);
  res.json({ success: true, message: 'Thank you! We will respond within 24 hours.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Charlizi API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
