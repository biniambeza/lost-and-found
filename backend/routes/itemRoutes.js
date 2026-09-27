const express = require('express');
const itemController = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadItemPhoto } = require('../middleware/upload');

const router = express.Router();
router.get('/', itemController.listItems);
router.post('/', protect, uploadItemPhoto, itemController.createItem);
router.get('/:id', optionalAuth, itemController.getItem);
router.put('/:id', protect, uploadItemPhoto, itemController.updateItem);
router.delete('/:id', protect, itemController.deleteItem);

module.exports = router;
