const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { getAdminStats, getAllUsers, deleteUser, updateUserRole } = require('../controllers/adminController');

router.use(auth, adminAuth);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/role', updateUserRole);

module.exports = router;
