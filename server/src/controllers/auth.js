const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const {
      name, email, password, phone, role, department, course, semester, studentId, section,
      employeeId, designation, qualification, joiningDate,
    } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(422).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(422).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Prevent non-admins from registering as admin
    const userRole = role || ROLES.STUDENT;
    if (![ROLES.STUDENT, ROLES.FACULTY].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only student and faculty accounts can be registered here',
      });
    }

    if (userRole === ROLES.STUDENT && (!department || !course || !semester || !studentId || !section)) {
      return res.status(422).json({
        success: false,
        message: 'Students must provide department, course, semester, roll number, and section',
      });
    }

    if (userRole === ROLES.STUDENT && (!mongoose.isValidObjectId(department) || !mongoose.isValidObjectId(course))) {
      return res.status(422).json({ success: false, message: 'Select a valid department and course' });
    }

    if (userRole === ROLES.FACULTY && (!department || !employeeId || !designation || !qualification || !joiningDate)) {
      return res.status(422).json({
        success: false,
        message: 'Faculty must provide department, employee ID, designation, qualification, and joining date',
      });
    }

    if (userRole === ROLES.FACULTY && (!mongoose.isValidObjectId(department) || Number.isNaN(new Date(joiningDate).getTime()))) {
      return res.status(422).json({ success: false, message: 'Select a valid department and joining date' });
    }

    if (userRole === ROLES.FACULTY && await Faculty.findOne({ employeeId: String(employeeId).trim() })) {
      return res.status(422).json({
        success: false,
        message: 'Employee ID already exists',
      });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      phone,
      role: userRole,
      department,
    });

    if (userRole === ROLES.STUDENT) {
      try {
        await Student.create({
          userId: user._id,
          studentId: String(studentId).trim(),
          department,
          course,
          semester: Number(semester),
          year: Math.ceil(Number(semester) / 2),
          section: String(section).trim(),
        });
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        throw error;
      }
    }

    if (userRole === ROLES.FACULTY) {
      try {
        await Faculty.create({
          userId: user._id,
          employeeId: String(employeeId).trim(),
          department,
          designation: String(designation).trim(),
          qualification: String(qualification).trim(),
          joiningDate: new Date(joiningDate),
        });
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        throw error;
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email: identifier, password, role } = req.body;
    const normalizedIdentifier = String(identifier || '').trim().toLowerCase();

    if (!normalizedIdentifier || !password || !role) {
      return res.status(422).json({
        success: false,
        message: 'Please provide email, password, and account role',
      });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(422).json({ success: false, message: 'Select a valid account role' });
    }

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}. Select the ${user.role} login option.`,
      });
    }

    const additionalData = user.role === ROLES.STUDENT
      ? await Student.findOne({ userId: user._id }).populate(['department', 'course'])
      : null;
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          additionalData,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    const additionalData = user.role === ROLES.STUDENT
      ? await Student.findOne({ userId: user._id }).populate(['department', 'course'])
      : null;

    res.status(200).json({
      success: true,
      data: { ...user.toObject(), additionalData },
    });
  } catch (error) {
    next(error);
  }
};
