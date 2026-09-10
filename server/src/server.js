require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const ensureAdmin = require('./config/ensureAdmin');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB().then(ensureAdmin).then(() => {
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
