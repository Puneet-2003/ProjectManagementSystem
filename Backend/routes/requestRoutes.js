const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const {
  getPendingRequests,
  updateRequestStatus,
  getUserRequests
} = require('../controllers/requestController');

router.get('/pending', authenticate, isAdmin, getPendingRequests);


router.put('/:requestId', authenticate, isAdmin, updateRequestStatus);

router.get('/my-requests', authenticate, getUserRequests);

module.exports = router;