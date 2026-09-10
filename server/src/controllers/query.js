const Query = require('../models/Query');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const assignedTo = async (userId, studentId) => {
  const faculty = await Faculty.findOne({ userId }).select('_id');
  return faculty && Student.exists({ _id: studentId, assignedFaculty: faculty._id });
};

exports.getQueries = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id }).select('_id');
      query.student = student?._id || null;
    } else if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      const students = await Student.find({ assignedFaculty: faculty?._id }).select('_id');
      query.student = { $in: students.map((item) => item._id) };
    }
    res.status(200).json({ success: true, data: await Query.find(query).populate('student respondedBy').sort({ createdAt: -1 }) });
  } catch (error) { next(error); }
};

exports.createQuery = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).select('_id');
    if (!student) return res.status(422).json({ success: false, message: 'Student profile not found' });
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(422).json({ success: false, message: 'Subject and message are required' });
    res.status(201).json({ success: true, data: await Query.create({ student: student._id, subject, message }) });
  } catch (error) { next(error); }
};

exports.respondQuery = async (req, res, next) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ success: false, message: 'Query not found' });
    if (req.user.role === 'faculty' && !(await assignedTo(req.user._id, query.student))) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    query.response = req.body.response;
    query.status = 'answered';
    query.respondedBy = req.user._id;
    await query.save();
    res.status(200).json({ success: true, message: 'Query answered', data: query });
  } catch (error) { next(error); }
};
