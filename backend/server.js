import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import subscribeRoutes from './routes/subscribe.js';
import authRoutes from './routes/auth.js';
import planRoutes from './routes/plan.js';
import postRoutes from './routes/posts.js';
import { getDb } from './services/firebase.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Without a secret we cannot sign login tokens, so stop straight away
// with a clear message instead of failing later.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error(
    'JWT_SECRET is missing or too short. Add a long random string to backend/.env',
  );
  process.exit(1);
}

// only let our React app talk to this server.
// CLIENT_URL can hold several addresses separated by commas,
// for example the Netlify link and http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/subscribe', subscribeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/posts', postRoutes);

// anything else is a 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// catches things like broken JSON in the request body
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request is too large' });
  }
  res.status(500).json({ message: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // check the Firestore connection now so a missing key shows up right away
  try {
    getDb();
    console.log('Connected to Firestore');
  } catch (err) {
    console.error('Firestore is not ready:', err.message);
  }
});
