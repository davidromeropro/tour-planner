const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	guests: Number,
	startDate: Date,
	endDate: Date,
	totalPrice: Number,
	activities: [
		{
			_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
			startTime: Date,
			endTime: Date
		}
	]
}, { timestamps: true });

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;