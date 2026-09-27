const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			maxlength: 254,
			match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		},
		password: { type: String, required: true, minlength: 8, maxlength: 128, select: false },
		role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
	},
	{ timestamps: true },
);

userSchema.set('toJSON', {
	transform(_document, returnedObject) {
		delete returnedObject.password;
		delete returnedObject.__v;
		return returnedObject;
	},
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
