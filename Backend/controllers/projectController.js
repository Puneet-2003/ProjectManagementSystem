const Project = require('../models/Project');
const Request = require('../models/Request');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, description, location, phoneNumber, email, startDate, endDate } = req.body;

    if (!name || !location || !phoneNumber || !email || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    const existingProject = await Project.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      createdBy: req.user._id
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'You already have a project with this name'
      });
    }

    const project = new Project({
      name,
      description,
      location,
      phoneNumber,
      email,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user._id,
      accessibleTo: [req.user._id]
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating project'
    });
  }
};

const getProjects = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.userType !== 'admin') {
      query = {
        $or: [
          { createdBy: req.user._id },
          { accessibleTo: req.user._id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'username email userType')
      .populate('accessibleTo', 'username email userType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
};

const getAllProjectsForAdmin = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'username email')
      .populate('accessibleTo', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const requestAccess = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      project.createdBy.toString() === req.user._id.toString() || 
      project.accessibleTo.some(id => id.toString() === req.user._id.toString())
    ) {
      return res.status(400).json({
        success: false,
        message: 'You already have access to this project'
      });
    }

    const existingRequest = await Request.findOne({
      user: req.user._id,
      project: projectId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this project'
      });
    }

    const request = new Request({
      user: req.user._id,
      project: projectId,
      status: 'pending'
    });

    await request.save();

    await request.populate('user', 'username email');
    await request.populate('project', 'name location');

    res.status(201).json({
      success: true,
      message: 'Access request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Request access error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting access request'
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('accessibleTo', 'username email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      req.user.userType !== 'admin' &&
      project.createdBy._id.toString() !== req.user._id.toString() &&
      !project.accessibleTo.some(user => user._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
};

const getProjectUsers = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'username email')
      .populate('accessibleTo', 'username email userType');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const allUsers = await User.find({ userType: 'client' }).select('username email');
    
    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        createdBy: project.createdBy,
        accessibleTo: project.accessibleTo
      },
      allClients: allUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const unassignProjectFromUser = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const userIndex = project.accessibleTo.findIndex(
      accessibleUserId => accessibleUserId.toString() === userId
    );
    
    if (userIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'User does not have access to this project'
      });
    }
    
    project.accessibleTo.splice(userIndex, 1);
    await project.save();
    
    await Request.updateMany(
      {
        user: userId,
        project: id,
        status: 'pending'
      },
      {
        status: 'denied',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        notes: 'Access revoked by admin'
      }
    );
    
    res.json({
      success: true,
      message: 'User removed from project successfully'
    });
  } catch (error) {
    console.error('Error in unassignProjectFromUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user from project',
      error: error.message
    });
  }
};

const assignProjectToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'client') {
      return res.status(400).json({
        success: false,
        message: 'Only clients can be assigned to projects'
      });
    }

    const alreadyHasAccess = project.accessibleTo.some(
      accessibleUserId => accessibleUserId.toString() === userId
    );

    if (alreadyHasAccess) {
      return res.status(400).json({
        success: false,
        message: 'User already has access to this project'
      });
    }

    project.accessibleTo.push(userId);
    await project.save();

    try {
      const Request = require('../models/Request');
      const request = new Request({
        user: userId,
        project: id,
        status: 'approved',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        notes: 'Directly assigned by admin'
      });
      await request.save();
    } catch (error) {
      console.log('Note: Could not create request record', error.message);
    }

    res.json({
      success: true,
      message: `Project "${project.name}" assigned to ${user.username} successfully`,
      project: {
        id: project._id,
        name: project.name
      }
    });
  } catch (error) {
    console.error('Error in assignProjectToUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning project to user',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getAllProjectsForAdmin,
  requestAccess,
  getProjectById,
  getProjectUsers,
  assignProjectToUser, 
  unassignProjectFromUser
};
