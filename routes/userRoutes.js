const express = require('express');
const router = express.Router();
const { getUsersData, getAllReservations } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/usersdata', protect, getUsersData);
router.get('/getAllReservations', protect, getAllReservations);

module.exports = router;
