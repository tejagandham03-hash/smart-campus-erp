const Examination = require('../models/Examination');

exports.getExaminations = async (req, res, next) => {
  try {
    const { course, semester, subject, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;

    const total = await Examination.countDocuments(query);
    const examinations = await Examination.find(query)
      .populate('course')
      .populate('subject')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: examinations,
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

exports.getExamination = async (req, res, next) => {
  try {
    const examination = await Examination.findById(req.params.id)
      .populate('course')
      .populate('subject');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found',
      });
    }

    res.status(200).json({
      success: true,
      data: examination,
    });
  } catch (error) {
    next(error);
  }
};

exports.createExamination = async (req, res, next) => {
  try {
    const { name, course, semester, subject, date, startTime, endTime, room, totalMarks } = req.body;

    const examination = await Examination.create({
      name,
      course,
      semester,
      subject,
      date,
      startTime,
      endTime,
      room,
      totalMarks,
    });

    const populated = await examination.populate(['course', 'subject']);

    res.status(201).json({
      success: true,
      message: 'Examination created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExamination = async (req, res, next) => {
  try {
    const examination = await Examination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('course')
      .populate('subject');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Examination updated successfully',
      data: examination,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExamination = async (req, res, next) => {
  try {
    const examination = await Examination.findByIdAndDelete(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Examination deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
