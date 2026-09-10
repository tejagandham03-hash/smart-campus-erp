const Subject = require('../models/Subject');

exports.getSubjects = async (req, res, next) => {
  try {
    const { course, semester, status } = req.query;
    const query = {};
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (status) query.status = status;

    const subjects = await Subject.find(query)
      .populate('course')
      .populate('faculty')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('course')
      .populate('faculty');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, course, semester, credits, faculty, description } = req.body;

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      course,
      semester,
      credits,
      faculty,
      description,
    });

    const populated = await subject.populate(['course', 'faculty']);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('course')
      .populate('faculty');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
