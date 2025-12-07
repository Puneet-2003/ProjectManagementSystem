const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const User = require('../models/User');
const Request = require('../models/Request');
const { Readable } = require('stream');


router.get('/', authenticate, isAdmin, async (req, res) => {
  try {

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');


    const reportStream = new Readable({
      read() {}
    });


    reportStream.pipe(res);


    const sendChunk = (data) => {
      reportStream.push(JSON.stringify(data) + '\n');
    };


    sendChunk({
      type: 'header',
      message: 'Project Management System Report',
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.username
    });

    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ userType: 'admin' });
    const clientUsers = await User.countDocuments({ userType: 'client' });
    
    sendChunk({
      type: 'user_stats',
      data: {
        totalUsers,
        adminUsers,
        clientUsers,
        activeUsers: await User.countDocuments({ isActive: true }),
        inactiveUsers: await User.countDocuments({ isActive: false })
      }
    });


    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    
    sendChunk({
      type: 'project_stats',
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects: await Project.countDocuments({ status: 'on-hold' }),
        averageProjectDuration: await calculateAverageProjectDuration()
      }
    });

    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const deniedRequests = await Request.countDocuments({ status: 'denied' });
    
    sendChunk({
      type: 'request_stats',
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        deniedRequests,
        approvalRate: totalRequests > 0 ? (approvedRequests / totalRequests * 100).toFixed(2) + '%' : '0%'
      }
    });

    sendChunk({
      type: 'recent_activities',
      data: {
        recentProjects: await Project.find().sort({ createdAt: -1 }).limit(5),
        recentUsers: await User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
        recentRequests: await Request.find().sort({ requestedAt: -1 }).limit(5)
          .populate('user', 'username')
          .populate('project', 'name')
      }
    });

    const upcomingProjects = await Project.find({
      startDate: { $gte: new Date() }
    }).sort({ startDate: 1 }).limit(5);

    const endingProjects = await Project.find({
      endDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: 'active'
    }).sort({ endDate: 1 }).limit(5);

    sendChunk({
      type: 'timeline',
      data: {
        upcomingProjects,
        endingProjects
      }
    });

    sendChunk({ type: 'footer', message: 'Report generation completed' });
    reportStream.push(null);

  } catch (error) {
    console.error('Report generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
});

async function calculateAverageProjectDuration() {
  const projects = await Project.find({
    startDate: { $exists: true },
    endDate: { $exists: true }
  });
  
  if (projects.length === 0) return '0 days';
  
  const totalDuration = projects.reduce((sum, project) => {
    const duration = (project.endDate - project.startDate) / (1000 * 60 * 60 * 24);
    return sum + duration;
  }, 0);
  
  const averageDays = Math.round(totalDuration / projects.length);
  return `${averageDays} days`;
}


router.get('/users-csv', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    
    const csvHeader = 'Username,Email,User Type,Created At,Last Login,Status\n';
    const csvRows = users.map(user => 
      `"${user.username}","${user.email}","${user.userType}","${user.createdAt}","${user.lastLogin || 'Never'}","${user.isActive ? 'Active' : 'Inactive'}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating CSV report'
    });
  }
});

module.exports = router;