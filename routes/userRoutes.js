const express = require('express');
const router = express.Router();
const { getUsersData } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/usersdata', protect, getUsersData);

module.exports = router;
