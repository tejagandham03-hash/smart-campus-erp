const Placement = require('../models/Placement');
const PlacementApplication = require('../models/PlacementApplication');
const Student = require('../models/Student');

exports.getPlacements = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const total = await Placement.countDocuments(query);
    const placements = await Placement.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: placements,
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

exports.getPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: placement,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPlacement = async (req, res, next) => {
  try {
    const { companyName, jobTitle, description, location, salary, eligibility, deadline, requirements } =
      req.body;

    const placement = await Placement.create({
      companyName,
      jobTitle,
      description,
      location,
      salary,
      eligibility,
      deadline,
      requirements,
    });

    res.status(201).json({
      success: true,
      message: 'Placement opportunity created successfully',
      data: placement,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Placement opportunity updated successfully',
      data: placement,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Placement opportunity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.applyForPlacement = async (req, res, next) => {
  try {
    const { placement, resume } = req.body;
    const studentRecord = await Student.findOne({ userId: req.user._id }).select('_id');
    if (!studentRecord) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }
    const student = studentRecord._id;

    // Check if already applied
    const existingApplication = await PlacementApplication.findOne({
      student,
      placement,
    });

    if (existingApplication) {
      return res.status(422).json({
        success: false,
        message: 'You have already applied for this opportunity',
      });
    }

    const application = await PlacementApplication.create({
      student,
      placement,
      resume,
    });

    const populated = await application.populate(['student', 'placement']);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { placement: req.params.placementId };
    if (status) query.status = status;

    const total = await PlacementApplication.countDocuments(query);
    const applications = await PlacementApplication.find(query)
      .populate('student')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
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

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const application = await PlacementApplication.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    )
      .populate('student')
      .populate('placement');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
