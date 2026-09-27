const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(request, _response, next) {
	const [scheme, token] = (request.get('authorization') || '').split(' ');
	if (scheme !== 'Bearer' || !token) {
		return next(Object.assign(new Error('Sign in to continue.'), { statusCode: 401 }));
	}
	if (!process.env.JWT_SECRET) {
		return next(Object.assign(new Error('Authentication is not configured on the server.'), { statusCode: 500 }));
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(payload.sub).select('name email role');
		if (!user) return next(Object.assign(new Error('This account is no longer available.'), { statusCode: 401 }));
		request.user = user;
		return next();
	} catch (error) {
		if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
			return next(Object.assign(new Error('Your session has expired. Sign in again.'), { statusCode: 401 }));
		}
		return next(error);
	}
}

function requireAdmin(request, _response, next) {
	if (request.user?.role !== 'admin') {
		return next(Object.assign(new Error('Administrator access is required.'), { statusCode: 403 }));
	}
	return next();
}

async function optionalAuth(request, _response, next) {
	const [scheme, token] = (request.get('authorization') || '').split(' ');
	if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) return next();
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(payload.sub).select('name email role');
		if (user) request.user = user;
	} catch {
		// Guests can still browse; invalid tokens are ignored on public routes.
	}
	return next();
}

module.exports = { protect, requireAdmin, optionalAuth };
