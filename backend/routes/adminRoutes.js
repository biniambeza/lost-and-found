const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(protect, requireAdmin);
router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
