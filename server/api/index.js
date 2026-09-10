require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/database');
const ensureAdmin = require('../src/config/ensureAdmin');

let connectionPromise;

module.exports = async (req, res) => {
  if (connectionPromise === undefined) {
    connectionPromise = connectDB().then(ensureAdmin).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
  if (req.url !== '/' && !req.url.startsWith('/api/')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
};