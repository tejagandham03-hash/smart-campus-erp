const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

exports.getAttendance = async (req, res, next) => {
  try {
    const { student, subject, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role === 'student') {
      const ownStudent = await Student.findOne({ userId: req.user._id }).select('_id');
      query.student = ownStudent?._id || null;
    }
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      const assigned = await Student.find({ assignedFaculty: faculty?._id }).select('_id');
      query.student = { $in: assigned.map((item) => item._id) };
    }
    if (student && req.user.role !== 'student') query.student = student;
    if (subject) query.subject = subject;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .populate('student')
      .populate('subject')
      .populate('faculty')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance,
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

exports.markAttendance = async (req, res, next) => {
  try {
    const { student, subject, date, status } = req.body;

    if (!student || !subject || !date || !status || Number.isNaN(new Date(date).getTime())) {
      return res.status(422).json({
        success: false,
        message: 'Student, subject, date, and status are required',
      });
    }

    if (!mongoose.isValidObjectId(student) || !mongoose.isValidObjectId(subject)) {
      return res.status(422).json({
        success: false,
        message: 'Select a valid student and subject',
      });
    }

    if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
      return res.status(422).json({
        success: false,
        message: 'Invalid attendance status',
      });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Check if attendance already marked for the same calendar day.
    const existing = await Attendance.findOne({
      student,
      subject,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) {
      return res.status(422).json({
        success: false,
        message: 'Attendance already marked for this date',
      });
    }

    let faculty;
    if (req.user.role === 'faculty') {
      faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!faculty) {
        return res.status(422).json({
          success: false,
          message: 'No faculty profile is linked to this account',
        });
      }
    }

    if (req.user.role === 'faculty') {
      const assignedStudent = await Student.findOne({ _id: student, assignedFaculty: faculty._id });
      if (!assignedStudent) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    const attendance = await Attendance.create({
      student,
      subject,
      faculty: faculty?._id,
      date: attendanceDate,
      status,
    });

    const populated = await attendance.populate(['student', 'subject', 'faculty']);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (req.user.role === 'faculty') {
      const existing = await Attendance.findById(req.params.id).select('student');
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!existing || !(await Student.exists({ _id: existing.student, assignedFaculty: faculty?._id }))) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
      return res.status(422).json({
        success: false,
        message: 'Invalid attendance status',
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('student')
      .populate('subject')
      .populate('faculty');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { student, subject } = req.query;

    let scopedStudent = student;
    if (req.user.role === 'student') {
      const ownStudent = await Student.findOne({ userId: req.user._id }).select('_id');
      scopedStudent = ownStudent?._id;
    }
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      const assigned = await Student.exists({ _id: student, assignedFaculty: faculty?._id });
      if (!assigned) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }
    const query = { student: scopedStudent };
    if (subject) query.subject = subject;

    const attendanceRecords = await Attendance.find(query);

    if (attendanceRecords.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0,
        },
      });
    }

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = attendanceRecords.filter((a) => a.status === ATTENDANCE_STATUS.ABSENT).length;
    const late = attendanceRecords.filter((a) => a.status === ATTENDANCE_STATUS.LATE).length;
    const percentage = ((present + late) / total) * 100;

    res.status(200).json({
      success: true,
      data: {
        total,
        present,
        absent,
        late,
        percentage: Math.round(percentage * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};
