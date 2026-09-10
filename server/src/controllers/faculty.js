const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Department = require('../models/Department');
const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/[\s_()\-.]/g, '');

const resolveDepartment = async (value) => {
  const input = String(value ?? '').trim();
  if (!input) return null;
  if (mongoose.isValidObjectId(input)) return Department.findById(input);
  const departments = await Department.find({});
  const normalizedInput = normalize(input);
  return departments.find((department) => normalize(department.code) === normalizedInput || normalize(department.name) === normalizedInput) || null;
};

exports.getFaculty = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, department } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      const user = await User.find({
        name: { $regex: search, $options: 'i' },
      });
      const userIds = user.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    const total = await Faculty.countDocuments(query);
    const faculty = await Faculty.find(query)
      .populate('userId')
      .populate('department')
      .populate('subjects')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: faculty,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('userId')
      .populate('department')
      .populate('subjects');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

exports.createFaculty = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      department,
      designation,
      qualification,
      joiningDate,
    } = req.body;

    const normalizedEmployeeId = String(employeeId || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const departmentRecord = await resolveDepartment(department);
    if (!name || !normalizedEmail || !password || !normalizedEmployeeId || !designation || !qualification || !joiningDate) {
      return res.status(422).json({ success: false, message: 'Name, email, password, employee ID, department, designation, qualification, and joining date are required' });
    }
    if (!departmentRecord) {
      return res.status(422).json({ success: false, message: 'Select a valid department' });
    }

    // Check if employee ID already exists
    const existingFaculty = await Faculty.findOne({ employeeId: normalizedEmployeeId });
    if (existingFaculty) {
      return res.status(422).json({
        success: false,
        message: 'Employee ID already exists',
      });
    }
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(422).json({ success: false, message: 'Email already belongs to another account' });
    }

    // Create user account
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      phone,
      role: ROLES.FACULTY,
      department: departmentRecord._id,
    });

    // Create faculty record
    let faculty;
    try {
      faculty = await Faculty.create({
        userId: user._id,
        employeeId: normalizedEmployeeId,
        department: departmentRecord._id,
        designation: String(designation).trim(),
        qualification: String(qualification).trim(),
        joiningDate,
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }

    const populated = await faculty.populate(['userId', 'department', 'subjects']);

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('userId')
      .populate('department')
      .populate('subjects');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    // Optionally delete associated user account
    await User.findByIdAndDelete(faculty.userId);

    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
