import WeatherReport from '../models/WeatherReport.js';

// @desc    Create a new weather report
// @route   POST /api/community/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { location, reportType, description } = req.body;
    
    // Parse location if it was sent as string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    // Map uploaded files
    const media = req.files ? req.files.map(file => ({
      url: file.path,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    })) : [];

    const report = await WeatherReport.create({
      user: req.user._id,
      location: parsedLocation,
      reportType,
      description,
      media,
    });

    // Populate user info before sending
    const populatedReport = await WeatherReport.findById(report._id).populate('user', 'name avatar');
    
    // Optionally emit event via socket.io for real-time feed update
    const io = req.app.get('io');
    if (io) {
      io.emit('new_report', populatedReport);
    }

    res.status(201).json(populatedReport);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all weather reports (with optional location filtering)
// @route   GET /api/community/reports
// @access  Public
const getReports = async (req, res, next) => {
  try {
    const reports = await WeatherReport.find()
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a report
// @route   PUT /api/community/reports/:id/like
// @access  Private
const toggleLikeReport = async (req, res, next) => {
  try {
    const report = await WeatherReport.findById(req.params.id);

    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    const hasLiked = report.likes.includes(req.user._id);

    if (hasLiked) {
      report.likes = report.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      report.likes.push(req.user._id);
    }

    await report.save();
    res.json(report.likes);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to report
// @route   POST /api/community/reports/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const report = await WeatherReport.findById(req.params.id);

    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    const comment = {
      user: req.user._id,
      text,
    };

    report.comments.push(comment);
    await report.save();
    
    const updatedReport = await WeatherReport.findById(req.params.id).populate('comments.user', 'name avatar');

    res.status(201).json(updatedReport.comments);
  } catch (error) {
    next(error);
  }
};

export { createReport, getReports, toggleLikeReport, addComment };
