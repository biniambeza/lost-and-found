require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);

app.use((request, response) => {
	response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` });
});

app.use((error, _request, response, _next) => {
	if (response.headersSent) return;
	if (error.name === 'ValidationError') return response.status(400).json({ message: error.message });
	if (error.code === 11000) return response.status(409).json({ message: 'An account with that email already exists.' });
	if (error.name === 'MulterError') {
		const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
		const message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : error.message;
		return response.status(status).json({ message });
	}
	if (error.statusCode) return response.status(error.statusCode).json({ message: error.message });
	console.error(error);
	return response.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function startServer() {
	if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in backend/.env before starting the server.');
	if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in backend/.env before starting the server.');
	await mongoose.connect(process.env.MONGO_URI);
	const port = Number(process.env.PORT) || 5000;
	return app.listen(port, () => console.log(`Lost & Found API listening on port ${port}`));
}

if (require.main === module) {
	startServer().catch((error) => {
		console.error(`Server startup failed: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { app, startServer };
