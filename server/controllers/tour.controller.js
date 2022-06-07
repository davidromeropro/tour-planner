const Tour = require('../models/tour.model');

module.exports.findTours = async (req, res) => {
	try {
		const tours = await Tour.find({createdBy: req.params.id});
		// 200 OK
		res.status(200).json({ tours });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.findTourActivities = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id).populate({
			path: 'activities._id',
			model: 'Activity'
		});
		// 200 OK
		res.status(200).json({ tour });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.createTour = async (req, res) => {
	try {
		const tour = await Tour.create(req.body);
		// 201 Created
		res.status(201).json({ _id: tour._id });
	} catch (error) {
		console.log(error);
		// 400 Bad Request
		res.status(400).json({ msg: 'Something went wrong', error });
	}		
};

module.exports.updateTour = async (req, res) => {
	try {
		await Tour.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
		//  200 OK
		res.status(200).json({ msg: 'success!' });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);
		//  200 OK
		res.status(200).json({ msg: 'success!' });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};
