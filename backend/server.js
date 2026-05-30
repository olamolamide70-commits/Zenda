require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initReminders } = require('./utils/reminderCron');
const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Initialize Cron Jobs
initReminders();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:2000',
    'http://localhost:5173',
    'https://zenda-beta.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.groq.com", "https://api.openai.com", "*.supabase.co"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(limiter);
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/installments', require('./routes/installmentRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/insurance', require('./routes/insuranceRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notifications/push', require('./routes/pushRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/b2b', require('./routes/b2bRoutes'));
app.use('/api/b2b/organization', require('./routes/b2bOrgRoutes'));



app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Zenda API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
const https = require('https');

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Keep-alive logic for Render (Free Tier)
  const url = process.env.BACKEND_URL || `https://gadgetflex-backend.onrender.com`;
  setInterval(() => {
    https.get(`${url}/health`, (res) => {
      console.log(`[Keep-Alive] Pinged ${url}/health: Status ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[Keep-Alive Error]:', err.message);
    });
  }, 600000); // 10 minutes
});
