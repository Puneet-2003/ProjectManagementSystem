const Request = require('../models/Request');
const Project = require('../models/Project');
const User = require('../models/User');

const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('user', 'username email userType')
      .populate('project', 'name location createdBy')
      .populate('project.createdBy', 'username email')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get pending requests error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending requests'
    });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "denied"'
      });
    }

    const request = await Request.findById(requestId)
      .populate('user', '_id username')
      .populate('project', '_id name accessibleTo');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`
      });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (notes) request.notes = notes;

    await request.save();

    if (status === 'approved') {
      const project = await Project.findById(request.project._id);
      if (!project.accessibleTo.includes(request.user._id)) {
        project.accessibleTo.push(request.user._id);
        await project.save();
      }
    }

    console.log(`Request ${status}: User ${request.user.username} for Project ${request.project.name}`);

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request
    });
  } catch (error) {
    console.error('Update request error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating request'
    });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate('project', 'name location status')
      .populate('reviewedBy', 'username')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get user requests error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user requests'
    });
  }
};

module.exports = {
  getPendingRequests,
  updateRequestStatus,
  getUserRequests
};
