const Activity = require('../models/activity.model');
const dayjs = require('dayjs');


module.exports.findActivities = async (req, res) => {
	try {
		const activities = await Activity.find({});
		// 200 OK
		res.status(200).json({ activities })
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.findActivitiesByDateRange = async (req, res) => {
	try {
		// get the days between the start and end dates
		const startDate = parseInt(req.params.startDate);
		const endDate = parseInt(req.params.endDate);
		const dateArray = [];
		let currentDate = startDate;
		while (currentDate <= endDate) {
			dateArray.push(new Date(currentDate));
			currentDate = (new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() + 1))).getTime();
		}
		// get day numbers from the days array
		const dayNumbers = dateArray.map(day => day.getDay().toString());

		// get activities that have the day number in the dayNumbers array
		const activities = await Activity.find().where('availability.day').in(dayNumbers);

		const result = activities.map(activity => {
			const days = activity.availability.map(day => day.day);
			const activityDates = dateArray.filter(date => days.includes(date.getDay().toString()));
			const activityAvailabilities = activityDates.map(date => {
				const times = activity.availability.filter(day => day.day === date.getDay().toString());
				const availableDate = dayjs(date);
				const data = times.map((time) => {
					const startTime = dayjs(time.startTime);
					const endTime = dayjs(time.endTime);
					const startDate = availableDate.set('hour', startTime.get('hour')).set('minute', startTime.get('minute'));
					const endDate = availableDate.set('hour', endTime.get('hour')).set('minute', endTime.get('minute'));
					return {
						label: `${availableDate.format('dddd, MMMM DD')}, ${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`,
						value: `${startDate.valueOf()}_${endDate.valueOf()}`
					}
				});
				return data;
			}).flat();
			console.log('activityAvailabilities', activityAvailabilities);

			return {
				...activity._doc,
				activityAvailabilities
			};
		});

		// 200 OK
		res.status(200).json({ activities: result });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.findActivity = async (req, res) => {
	try {
		const activity = await Activity.findById(req.params.id);
		// 200 OK
		res.status(200).json({ activity })
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.createActivity = async (req, res) => {
	try {
		const activity = await Activity.create(req.body);
		// 201 Created
		res.status(201).json({ _id: activity._id });
	} catch (error) {
		console.log(error);
		// 400 Bad Request
		res.status(400).json({ msg: 'Something went wrong', error });
	}
};

module.exports.updateActivity = async (req, res) => {
	try {
		await Activity.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
		//  200 OK
		res.status(200).json({ msg: 'success!' });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};

module.exports.deleteActivity = async (req, res) => {
	try {
		await Activity.findByIdAndDelete(req.params.id);
		//  200 OK
		res.status(200).json({ msg: 'success!' });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};
