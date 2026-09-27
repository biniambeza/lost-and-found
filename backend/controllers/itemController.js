const mongoose = require('mongoose');
const Item = require('../models/Item');

const editableFields = ['type', 'title', 'description', 'category', 'location', 'date', 'status'];

function isValidItemInput(body) {
	return (
		['lost', 'found'].includes(body.type) &&
		typeof body.title === 'string' && body.title.trim().length >= 3 && body.title.trim().length <= 120 &&
		typeof body.description === 'string' && body.description.trim().length >= 10 && body.description.trim().length <= 3000 &&
		typeof body.category === 'string' && body.category.trim().length > 0 && body.category.trim().length <= 80 &&
		typeof body.location === 'string' && body.location.trim().length > 0 && body.location.trim().length <= 160 &&
		Boolean(body.date) && !Number.isNaN(new Date(body.date).getTime())
	);
}

function cleanItemInput(body) {
	return Object.fromEntries(editableFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

async function listItems(request, response) {
	const { type, status, category, q } = request.query;
	if (type && !['lost', 'found'].includes(type)) return response.status(400).json({ message: 'Type must be lost or found.' });
	if (status && !['open', 'resolved'].includes(status)) return response.status(400).json({ message: 'Status must be open or resolved.' });

	const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 20, 1), 50);
	const filter = {};
	if (type) filter.type = type;
	if (status) filter.status = status;
	if (category) filter.category = category;
	if (typeof q === 'string' && q.trim()) {
		const safeQuery = q.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		filter.$or = ['title', 'description', 'category', 'location'].map((field) => ({
			[field]: { $regex: safeQuery, $options: 'i' },
		}));
	}

	const [items, total] = await Promise.all([
		Item.find(filter).populate('postedBy', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
		Item.countDocuments(filter),
	]);
	return response.json({ items, page, pages: Math.ceil(total / limit), total });
}

async function getItem(request, response) {
	if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid item ID.' });
	const posterFields = request.user ? 'name email' : 'name';
	const item = await Item.findById(request.params.id).populate('postedBy', posterFields);
	if (!item) return response.status(404).json({ message: 'Item not found.' });
	return response.json({ item });
}

async function createItem(request, response) {
	const body = request.body;
	if (!isValidItemInput(body)) return response.status(400).json({ message: 'Complete all required fields with valid values.' });

	const item = await Item.create({
		...cleanItemInput(body),
		status: 'open',
		title: body.title.trim(),
		description: body.description.trim(),
		category: body.category.trim(),
		location: body.location.trim(),
		photoUrl: request.file?.path || '',
		postedBy: request.user._id,
	});
	await item.populate('postedBy', 'name');
	return response.status(201).json({ item });
}

function isItemOwner(item, user) {
	return item.postedBy.toString() === user.id;
}

async function updateItem(request, response) {
	if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid item ID.' });
	const item = await Item.findById(request.params.id);
	if (!item) return response.status(404).json({ message: 'Item not found.' });

	const isAdmin = request.user.role === 'admin';
	if (!isAdmin && !isItemOwner(item, request.user)) {
		return response.status(403).json({ message: 'You can only update your own listing.' });
	}
	if (!isAdmin) {
		if (request.body.status !== 'resolved' || Object.keys(request.body).some((field) => field !== 'status')) {
			return response.status(403).json({ message: 'You can only mark your own listing as resolved.' });
		}
		item.status = 'resolved';
	} else {
		const updates = cleanItemInput(request.body);
		if (request.file) updates.photoUrl = request.file.path;
		for (const [field, value] of Object.entries(updates)) item[field] = value;
	}

	await item.save();
	await item.populate('postedBy', 'name');
	return response.json({ item });
}

async function deleteItem(request, response) {
	if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid item ID.' });
	const item = await Item.findById(request.params.id);
	if (!item) return response.status(404).json({ message: 'Item not found.' });
	if (request.user.role !== 'admin' && !isItemOwner(item, request.user)) {
		return response.status(403).json({ message: 'You can only delete your own listing.' });
	}
	await item.deleteOne();
	return response.json({ message: 'Listing deleted.' });
}

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
