const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');

    let additionalData = null;

    if (user.role === 'student') {
      additionalData = await Student.findOne({ userId: user._id }).populate([
        'department',
        'course',
      ]);
    } else if (user.role === 'faculty') {
      additionalData = await Faculty.findOne({ userId: user._id }).populate([
        'department',
        'subjects',
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        additionalData,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, username, password, currentPassword, phone, profilePhoto } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (username !== undefined) {
      const normalizedUsername = String(username).trim().toLowerCase();
      if (normalizedUsername) {
        const usernameOwner = await User.findOne({ username: normalizedUsername, _id: { $ne: req.user.id } }).select('_id');
        if (usernameOwner) return res.status(422).json({ success: false, message: 'Username is already in use' });
        updateData.username = normalizedUsername;
      } else {
        updateData.username = undefined;
      }
    }
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    if (password !== undefined) {
      const passwordValue = String(password);
      if (passwordValue.length < 6) return res.status(422).json({ success: false, message: 'Password must be at least 6 characters' });

      const currentUser = await User.findById(req.user.id).select('+password');
      if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

      if (currentPassword === undefined || currentPassword === null || currentPassword === '') {
        return res.status(422).json({ success: false, message: 'Current password is required to change the password.' });
      }

      const isMatch = await currentUser.matchPassword(String(currentPassword));
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      updateData.password = passwordValue;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
