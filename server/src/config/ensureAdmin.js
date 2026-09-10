const User = require('../models/User');
const { ROLES, USER_STATUS } = require('./constants');

const ensureAdmin = async () => {
  const username = String(process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();

  if (!username || !password || !email) {
    throw new Error('ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_EMAIL must be configured');
  }

  let admin = await User.findOne({ $or: [{ username }, { email }] }).select('+password');
  if (!admin) {
    admin = new User({
      name: 'PB Siddhartha Admin',
      username,
      email,
      password,
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });
  } else {
    admin.username = username;
    admin.email = email;
    admin.password = password;
    admin.role = ROLES.ADMIN;
    admin.status = USER_STATUS.ACTIVE;
  }

  await admin.save();
};

module.exports = ensureAdmin;