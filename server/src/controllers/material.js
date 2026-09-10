const Material = require('../models/Material');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

exports.getMaterials = async (req, res, next) => {
  try {
    const { course, subject, semester } = req.query;
    const query = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id }).select('course semester');
      if (!student) return res.status(200).json({ success: true, data: [] });
      query.course = student.course;
      query.semester = student.semester;
    }
    if (course && req.user.role !== 'student') query.course = course;
    if (subject) query.subject = subject;
    if (semester && req.user.role !== 'student') query.semester = Number(semester);
    const materials = await Material.find(query)
      .populate('course subject faculty')
      .populate({ path: 'faculty', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: materials });
  } catch (error) { next(error); }
};

exports.createMaterial = async (req, res, next) => {
  try {
    const { title, description, course, subject, semester } = req.body;
    if (!req.file || !title || !course || !subject || !semester) {
      return res.status(422).json({ success: false, message: 'Title, course, subject, semester, and a file are required' });
    }
    const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
    if (!faculty) return res.status(422).json({ success: false, message: 'No faculty profile is linked to this account' });
    const material = await Material.create({
      title, description, course, subject, semester: Number(semester), faculty: faculty._id,
      fileUrl: '/api/materials/file/pending', fileName: req.file.originalname,
      mimeType: req.file.mimetype, size: req.file.size,
      fileData: req.file.buffer,
    });
    material.fileUrl = `/api/materials/${material._id}/file`;
    await material.save();
    material.fileData = undefined;
    res.status(201).json({ success: true, message: 'Material uploaded successfully', data: await material.populate('course subject faculty') });
  } catch (error) { next(error); }
};

exports.getMaterialFile = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id).select('+fileData course semester');
    if (!material || !material.fileData) return res.status(404).json({ success: false, message: 'Material file not found' });
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id }).select('course semester');
      if (!student || String(student.course) !== String(material.course) || student.semester !== material.semester) {
        return res.status(403).json({ success: false, message: 'You cannot access this material' });
      }
    }
    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${material.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}"`);
    res.send(material.fileData);
  } catch (error) { next(error); }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) { next(error); }
};
