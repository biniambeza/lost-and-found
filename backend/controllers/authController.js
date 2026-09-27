const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
	if (!process.env.JWT_SECRET) {
		throw Object.assign(new Error('Authentication is not configured on the server.'), { statusCode: 500 });
	}
	return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
	});
}

function publicUser(user) {
	return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function signup(request, response) {
	const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
	const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
	const password = typeof request.body.password === 'string' ? request.body.password : '';

	if (name.length < 2 || name.length > 80) {
		return response.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
	}
	if (!emailPattern.test(email) || email.length > 254) {
		return response.status(400).json({ message: 'Enter a valid email address.' });
	}
	if (password.length < 8 || password.length > 128) {
		return response.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	const user = await User.create({ name, email, password: hashedPassword });
	return response.status(201).json({ token: createToken(user), user: publicUser(user) });
}

async function login(request, response) {
	const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
	const password = typeof request.body.password === 'string' ? request.body.password : '';
	if (!email || !password) {
		return response.status(400).json({ message: 'Email and password are required.' });
	}

	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await bcrypt.compare(password, user.password))) {
		return response.status(401).json({ message: 'Email or password is incorrect.' });
	}
	return response.json({ token: createToken(user), user: publicUser(user) });
}

async function me(request, response) {
	return response.json({ user: publicUser(request.user) });
}

module.exports = { signup, login, me };
