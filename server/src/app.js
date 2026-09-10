const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const { ROLES } = require('./config/constants');

const app = express();
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://smart-campus-erp-five.vercel.app',
  'http://localhost:5173',
].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Auth-specific rate limiter (relaxed in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 50,
  message: {
    success: false,
    message: 'Too many login or registration attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/students', require('./routes/student'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/departments', require('./routes/department'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/subjects', require('./routes/subject'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees', require('./routes/fee'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/examinations', require('./routes/examination'));
app.use('/api/results', require('./routes/result'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/placements', require('./routes/placement'));
app.use('/api/ai', require('./routes/ai'));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
app.use('/api/materials', require('./routes/material'));
app.use('/api/admin/import', require('./routes/adminImport'));
app.use('/api/queries', require('./routes/query'));

// Service information routes
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Campus ERP API is running',
    health: '/api/health',
  });
});
app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Campus ERP API is running',
    health: '/api/health',
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    deployment: '8ccaebb',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
