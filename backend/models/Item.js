const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
	{
		type: { type: String, enum: ['lost', 'found'], required: true, index: true },
		title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
		description: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
		category: { type: String, required: true, trim: true, maxlength: 80, index: true },
		location: { type: String, required: true, trim: true, maxlength: 160 },
		date: { type: Date, required: true },
		photoUrl: { type: String, default: '', trim: true },
		status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
		postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	},
	{ timestamps: true },
);

itemSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
