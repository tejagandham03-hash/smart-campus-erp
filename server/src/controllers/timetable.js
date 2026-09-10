const Timetable = require('../models/Timetable');

exports.getTimetable = async (req, res, next) => {
  try {
    const { course, day, faculty, semester } = req.query;
    const query = {};
    if (course) query.course = course;
    if (day) query.day = day;
    if (faculty) query.faculty = faculty;
    if (semester) query.semester = semester;

    const timetable = await Timetable.find(query)
      .populate('course')
      .populate('subject')
      .populate('faculty')
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTimetableEntry = async (req, res, next) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('course')
      .populate('subject')
      .populate('faculty');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTimetable = async (req, res, next) => {
  try {
    const { course, department, semester, section, subject, faculty, day, startTime, endTime, room } =
      req.body;

    const timetable = await Timetable.create({
      course,
      department,
      semester,
      section,
      subject,
      faculty,
      day,
      startTime,
      endTime,
      room,
    });

    const populated = await timetable
      .populate('course')
      .populate('subject')
      .populate('faculty');

    res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('course')
      .populate('subject')
      .populate('faculty');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable updated successfully',
      data: timetable,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
