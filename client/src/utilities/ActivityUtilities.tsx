export const activityTypes = [
	{ value: 'gt', label: 'Guided Tour' },
	{ value: 'mp', label: 'Museums/Parks' },
	{ value: 'ld', label: 'Lodging' },
	{ value: 'fd', label: 'Food' },
	{ value: 'tr', label: 'Transportation' },
];

export const regions = [
	{ value: 'pc', label: 'Pacific Coast' },
	{ value: 'gi', label: 'Galápagos Islands' },
	{ value: 'am', label: 'Andes Mountains' },
	{ value: 'aj', label: 'Amazon Jungle' },
];


export const daysInWeek = [
	{ value: '0', label: 'Sunday' },
	{ value: '1', label: 'Monday' },
	{ value: '2', label: 'Tuesday' },
	{ value: '3', label: 'Wednesday' },
	{ value: '4', label: 'Thursday' },
	{ value: '5', label: 'Friday' },
	{ value: '6', label: 'Saturday' },
];

// check if two date ranges overlap
export const dateRangeOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
	return (start1.getTime() <= end2.getTime()) && (end1.getTime() >= start2.getTime());
}

// check if multiple date ranges overlap
export const dateRangesOverlap = (ranges: Array<{ startTime: Date, endTime: Date }>) => {
	const [first, ...rest] = ranges;
	return rest.some((range) => dateRangeOverlap(first.startTime, first.endTime, range.startTime, range.endTime));
}

// convert Availability to a list of date ranges
export const availabilityToDateRanges = (availability: Array<{ day: string, startTime: Date, endTime: Date, _id: any, key: string }>) => {
	return availability.map((item) => {
		const startTime = new Date(item.startTime);
		const endTime = new Date(item.endTime);
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), parseInt(item.day), startTime.getHours(), startTime.getMinutes());
		const end = new Date(now.getFullYear(), now.getMonth(), parseInt(item.day), endTime.getHours(), endTime.getMinutes());
		return {
			startTime: start,
			endTime: end
		}
	});
}
