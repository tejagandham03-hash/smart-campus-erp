const Result = require('../models/Result');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const calculateGrade = (marks, maxMarks) => {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  return 'F';
};

exports.getResults = async (req, res, next) => {
  try {
    const { student, subject, examination, page = 1, limit = 10 } = req.query;
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
    if (examination) query.examination = examination;

    const total = await Result.countDocuments(query);
    const results = await Result.find(query)
      .populate('student')
      .populate('subject')
      .populate('examination')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: results,
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

exports.getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student')
      .populate('subject')
      .populate('examination');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.createResult = async (req, res, next) => {
  try {
    const { student, subject, examination, marks, maxMarks, remarks } = req.body;

    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!(await Student.exists({ _id: student, assignedFaculty: faculty?._id }))) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    const grade = calculateGrade(marks, maxMarks);

    const result = await Result.create({
      student,
      subject,
      examination,
      marks,
      maxMarks,
      grade,
      remarks,
    });

    const populated = await result.populate(['student', 'subject', 'examination']);

    res.status(201).json({
      success: true,
      message: 'Result created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpsertResults = async (req, res, next) => {
  try {
    const { examination, subject, semester, rows } = req.body;
    if (!examination || !subject || !Array.isArray(rows) || rows.length === 0) {
      return res.status(422).json({ success: false, message: 'Examination, subject, and at least one mark row are required' });
    }

    const studentIds = rows.map((row) => String(row.studentId || '').trim()).filter(Boolean);
    const studentQuery = { studentId: { $in: studentIds }, ...(semester ? { semester: Number(semester) } : {}) };
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      studentQuery.assignedFaculty = faculty?._id;
    }
    const students = await Student.find(studentQuery);
    const studentsById = new Map(students.map((student) => [student.studentId, student]));
    const errors = [];
    const operations = [];

    rows.forEach((row, index) => {
      const studentId = String(row.studentId || '').trim();
      const student = studentsById.get(studentId);
      const marks = Number(row.marks);
      const maxMarks = Number(row.maxMarks || 100);
      if (!student) errors.push(`Row ${index + 2}: student ${studentId || '(missing ID)'} was not found for the selected semester`);
      else if (!Number.isFinite(marks) || marks < 0 || marks > maxMarks) errors.push(`Row ${index + 2}: marks must be between 0 and max marks`);
      else operations.push({
        updateOne: {
          filter: { student: student._id, subject, examination },
          update: { $set: { student: student._id, subject, examination, marks, maxMarks, remarks: row.remarks || '', grade: calculateGrade(marks, maxMarks) } },
          upsert: true,
        },
      });
    });

    if (errors.length > 0) return res.status(422).json({ success: false, message: 'Spreadsheet validation failed', errors });
    const result = await Result.bulkWrite(operations);
    res.status(200).json({ success: true, message: `${operations.length} result(s) uploaded successfully`, data: { processed: operations.length, inserted: result.upsertedCount, updated: result.modifiedCount } });
  } catch (error) {
    next(error);
  }
};

exports.updateResult = async (req, res, next) => {
  try {
    const { marks, maxMarks, remarks } = req.body;
    if (req.user.role === 'faculty') {
      const existingResult = await Result.findById(req.params.id).select('student');
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!existingResult || !(await Student.exists({ _id: existingResult.student, assignedFaculty: faculty?._id }))) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    let updateData = { marks, maxMarks, remarks };

    if (marks && maxMarks) {
      updateData.grade = calculateGrade(marks, maxMarks);
    }

    const result = await Result.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('student')
      .populate('subject')
      .populate('examination');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
