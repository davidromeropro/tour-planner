import axios from 'axios';
const baseUrl = process.env.REACT_APP_TOURS_API_BASE_URL;
const urls = {
	'find': {
		url: baseUrl,
		method: 'get'
	},
	'findTourActivities': {
		url: `${baseUrl}activities/`,
		method: 'get'
	},
	'create': {
		url: baseUrl,
		method: 'post'
	},
	'update': {
		url: baseUrl,
		method: 'put'
	},
	'delete': {
		url: baseUrl,
		method: 'delete'
	}
};

type ActionKey = keyof typeof urls;

export const toursApi = (action: ActionKey, data?: any, param?: string, url?: string) => {
	const config = urls[action];
	axios.defaults.withCredentials = true;
	return axios({
		method: config.method,
		url: url || `${config.url}${param || ''}`,
		data: data
	});
}

