const Student = require('../models/Student');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

const normalizedValue = (value) => String(value ?? '').trim().toLowerCase().replace(/[\s_()\-.]/g, '');

const resolveReference = async (model, value) => {
  const input = String(value ?? '').trim();
  if (!input) return null;
  if (mongoose.isValidObjectId(input)) return model.findById(input);
  const records = await model.find({});
  const normalizedInput = normalizedValue(input);
  return records.find((record) => normalizedValue(record.code) === normalizedInput || normalizedValue(record.name) === normalizedInput) || null;
};

exports.getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status, department, course, semester, year } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role === ROLES.FACULTY) {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!faculty) return res.status(200).json({ success: true, data: [], pagination: { total: 0, page: 1, pages: 0 } });
      query.assignedFaculty = faculty._id;
    }
    if (status) query.status = status;
    if (department) query.department = department;
    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (year) query.year = Number(year);

    if (search) {
      const users = await User.find({
        name: { $regex: search, $options: 'i' },
      });
      const userIds = users.map((u) => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId')
      .populate('department')
      .populate('course')
      .populate('assignedFaculty')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: students,
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

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId')
      .populate('department')
      .populate('course');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (req.user.role === ROLES.FACULTY) {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!faculty || !(student.assignedFaculty || []).some((assigned) => String(assigned) === String(faculty._id))) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
      }
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      studentId,
      department,
      course,
      semester,
      section,
      dateOfBirth,
      address,
      guardianName,
      guardianPhone,
      assignedFaculty = [],
    } = req.body;

    const normalizedStudentId = String(studentId || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedSemester = Number(semester);
    const normalizedYear = Math.ceil(normalizedSemester / 2);
    const departmentRecord = await resolveReference(Department, department);
    const courseRecord = await resolveReference(Course, course);
    if (!departmentRecord) return res.status(422).json({ success: false, message: 'Select a valid department ID, code, or name' });
    if (!courseRecord) return res.status(422).json({ success: false, message: 'Select a valid course ID, code, or name' });
    if (String(courseRecord.department) !== String(departmentRecord._id)) {
      return res.status(422).json({ success: false, message: 'The selected course does not belong to the selected department' });
    }
    if (!Number.isInteger(normalizedSemester) || normalizedSemester < 1 || normalizedSemester > 6) {
      return res.status(422).json({ success: false, message: 'Semester must be a number from 1 to 6' });
    }
    const normalizedAssignedFaculty = Array.isArray(assignedFaculty)
      ? assignedFaculty.filter((item) => item && require('mongoose').isValidObjectId(item))
      : [];
    if (req.user.role === ROLES.FACULTY) {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!faculty) return res.status(403).json({ success: false, message: 'Faculty profile not found' });
      if (!normalizedAssignedFaculty.some((item) => String(item) === String(faculty._id))) normalizedAssignedFaculty.push(faculty._id);
    }
    const existingStudent = await Student.findOne({ studentId: normalizedStudentId });
    if (existingStudent) {
      return res.status(422).json({
        success: false,
        message: 'Student ID already exists',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: 'Email already belongs to another account',
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      role: ROLES.STUDENT,
      department: departmentRecord._id,
    });

    // Create student record
    let student;
    try {
      student = await Student.create({
        userId: user._id,
        studentId: normalizedStudentId,
        department: departmentRecord._id,
        course: courseRecord._id,
        year: normalizedYear,
        semester: normalizedSemester,
        section,
        dateOfBirth,
        address,
        guardianName,
        guardianPhone,
        assignedFaculty: normalizedAssignedFaculty,
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }

    const populated = await student.populate(['userId', 'department', 'course']);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) return res.status(404).json({ success: false, message: 'Student not found' });

    if (req.user.role === ROLES.FACULTY) {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!faculty || !(existingStudent.assignedFaculty || []).some((assigned) => String(assigned) === String(faculty._id))) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
      }
    }

    const updateData = { ...req.body };
    if (req.user.role === ROLES.FACULTY) delete updateData.assignedFaculty;
    const { name, email, phone } = updateData;
    delete updateData.name;
    delete updateData.email;
    delete updateData.phone;
    if (name || email || phone) {
      const userUpdate = {};
      if (name) userUpdate.name = String(name).trim();
      if (email) userUpdate.email = String(email).trim().toLowerCase();
      if (phone) userUpdate.phone = phone;
      await User.findByIdAndUpdate(existingStudent.userId, userUpdate, { runValidators: true });
    }
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('userId')
      .populate('department')
      .populate('course')
      .populate('assignedFaculty');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Optionally delete associated user account
    await User.findByIdAndDelete(student.userId);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
