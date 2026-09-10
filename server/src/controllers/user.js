const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

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
    const { name, phone, profilePhoto } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

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
