const mongoose = require('mongoose');

// const pointSchema = new mongoose.Schema({
// 	type: {
// 		type: String,
// 		enum: ['Point'],
// 		required: true
// 	},
// 	coordinates: {
// 		type: [Number],
// 		required: true
// 	}
// });


const ActivitySchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
		minlength: [3, 'Name must be at least 3 characters long']
	},
	description: {
		type: String,
		required: [true, 'Description is required']
	},
	type: {
		type: String,
		required: [true, 'Type is required']
	},
	image: {
		type: String
	},
	price: {
		type: Number
	},
	region: {
		type: String
	},
	contact:{
		type: String
	},
	availability: [{
		day: String, //0-6 mon - sun
		startTime: Date,
		endTime: Date,
		key: String
	}]
}, { timestamps: true });

const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;