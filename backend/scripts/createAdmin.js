require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

async function connectWithRetry(maxRetries = 5) {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
			await mongoose.connect(process.env.MONGO_URI, {
				serverSelectionTimeoutMS: 8000,
				connectTimeoutMS: 10000,
			});
			console.log('MongoDB connected successfully.');
			return;
		} catch (error) {
			console.warn(`Connection attempt ${attempt} failed: ${error.message}`);
			if (attempt === maxRetries) throw error;
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
}

async function main() {
	const email = process.argv[2];
	const password = process.argv[3];
	const name = process.argv[4] || 'Admin';

	if (!email) {
		console.log('\nUsage:');
		console.log('  node scripts/createAdmin.js <email> [password] [name]\n');
		console.log('Example:');
		console.log('  node scripts/createAdmin.js admin@example.com AdminPass123! "Site Admin"\n');
		process.exit(1);
	}

	if (!process.env.MONGO_URI) {
		console.error('MONGO_URI is missing in backend/.env');
		process.exit(1);
	}

	await connectWithRetry();
	const normalizedEmail = email.trim().toLowerCase();
	let user = await User.findOne({ email: normalizedEmail });

	if (user) {
		user.role = 'admin';
		if (password) {
			user.password = await bcrypt.hash(password, 12);
		}
		await user.save();
		console.log(`\nExisting user "${normalizedEmail}" has been successfully promoted to ADMIN.`);
	} else {
		if (!password || password.length < 8) {
			console.error('Password is required and must be at least 8 characters long for new users.');
			process.exit(1);
		}
		const hashedPassword = await bcrypt.hash(password, 12);
		user = await User.create({
			name: name.trim(),
			email: normalizedEmail,
			password: hashedPassword,
			role: 'admin',
		});
		console.log(`\nNew admin account created successfully:`);
		console.log(`- Name:  ${user.name}`);
		console.log(`- Email: ${user.email}`);
		console.log(`- Role:  ${user.role}`);
	}

	await mongoose.disconnect();
	process.exit(0);
}

main().catch((err) => {
	console.error('\nFailed to create/promote admin:', err.message);
	process.exit(1);
});
