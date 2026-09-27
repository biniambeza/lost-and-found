const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');

async function listUsers(_request, response) {
	const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 });
	return response.json({ users });
}

async function dashboard(_request, response) {
	const [users, openItems, resolvedItems, recentItems] = await Promise.all([
		User.countDocuments(),
		Item.countDocuments({ status: 'open' }),
		Item.countDocuments({ status: 'resolved' }),
		Item.find().populate('postedBy', 'name email').sort({ createdAt: -1 }).limit(50),
	]);
	return response.json({
		stats: { users, openItems, resolvedItems, items: openItems + resolvedItems },
		items: recentItems,
	});
}

async function updateUserRole(request, response) {
	if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid user ID.' });
	if (!['user', 'admin'].includes(request.body.role)) return response.status(400).json({ message: 'Role must be user or admin.' });
	const user = await User.findById(request.params.id);
	if (!user) return response.status(404).json({ message: 'User not found.' });
	if (user.role === 'admin' && request.body.role === 'user' && await User.countDocuments({ role: 'admin' }) <= 1) {
		return response.status(409).json({ message: 'The last administrator cannot be demoted.' });
	}

	user.role = request.body.role;
	await user.save();
	return response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

async function deleteUser(request, response) {
	if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid user ID.' });
	if (request.params.id === request.user.id) return response.status(400).json({ message: 'You cannot delete your own account here.' });
	const user = await User.findById(request.params.id);
	if (!user) return response.status(404).json({ message: 'User not found.' });
	if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
		return response.status(409).json({ message: 'The last administrator cannot be deleted.' });
	}

	await Item.deleteMany({ postedBy: user._id });
	await user.deleteOne();
	return response.json({ message: 'User and their listings deleted.' });
}

module.exports = { dashboard, listUsers, updateUserRole, deleteUser };
