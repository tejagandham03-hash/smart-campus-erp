const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const { FEE_STATUS } = require('../config/constants');

exports.getFees = async (req, res, next) => {
  try {
    const { student, status, page = 1, limit = 10 } = req.query;
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
    if (status) query.status = status;

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: fees,
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

exports.getFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('student');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }
    if (req.user.role === 'student' && String(fee.student.userId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'You cannot access this fee record' });
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      const assigned = await Student.exists({ _id: fee.student._id, assignedFaculty: faculty?._id });
      if (!assigned) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    res.status(200).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

exports.createFee = async (req, res, next) => {
  try {
    const { student, academicYear, semester, feeType, amount, dueDate, paidAmount = 0, status = FEE_STATUS.PENDING } = req.body;
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!(await Student.exists({ _id: student, assignedFaculty: faculty?._id }))) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    const fee = await Fee.create({
      student,
      academicYear,
      semester,
      feeType,
      amount,
      dueDate,
      paidAmount: Number(paidAmount),
      status,
    });

    const populated = await fee.populate('student');
    await Notification.create({
      title: 'Fee payment pending',
      message: status === FEE_STATUS.PAID
        ? `${feeType} fee of ${amount} has been marked as paid.`
        : `${feeType} fee of ${amount} is due on ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'fees',
      targetUsers: [populated.student.userId],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFee = async (req, res, next) => {
  try {
    const { paidAmount, status, paymentDate, transactionId } = req.body;
    const existing = await Fee.findById(req.params.id).select('student');
    if (!existing) return res.status(404).json({ success: false, message: 'Fee record not found' });
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id }).select('_id');
      if (!student || String(existing.student) !== String(student._id)) return res.status(403).json({ success: false, message: 'You cannot update this fee record' });
    }
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id }).select('_id');
      if (!(await Student.exists({ _id: existing.student, assignedFaculty: faculty?._id }))) return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      {
        paidAmount,
        status,
        paymentDate,
        transactionId,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('student');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee updated successfully',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeeStatistics = async (req, res, next) => {
  try {
    const total = await Fee.countDocuments();
    const collected = await Fee.countDocuments({ status: FEE_STATUS.PAID });
    const pending = await Fee.countDocuments({
      status: { $in: [FEE_STATUS.PENDING, FEE_STATUS.PARTIALLY_PAID, FEE_STATUS.OVERDUE] },
    });

    const collectedAmount = await Fee.aggregate([
      { $match: { status: FEE_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        collected,
        pending,
        collectedAmount: collectedAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
