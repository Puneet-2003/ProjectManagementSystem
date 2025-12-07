const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getAllProjectsForAdmin,
  requestAccess,
  getProjectById,
  getProjectUsers,
  assignProjectToUser,
  unassignProjectFromUser
} = require('../controllers/projectController');

router.get('/', authenticate, getProjects);


router.get('/all', authenticate, isAdmin, getAllProjectsForAdmin);


router.get('/:id', authenticate, getProjectById);


router.get('/create', authenticate, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Create project form',
    required_fields: [
      'name',
      'location',
      'phoneNumber (10 digits)',
      'email',
      'startDate',
      'endDate'
    ],
    optional_fields: ['description']
  });
});

router.post('/create', authenticate, isAdmin, createProject);


router.post('/request-access', authenticate, requestAccess);


router.get('/:id/users', authenticate, isAdmin, getProjectUsers);


router.post('/:id/assign', authenticate, isAdmin, assignProjectToUser);

router.delete('/:id/unassign/:userId', authenticate, isAdmin, unassignProjectFromUser);

module.exports = router;