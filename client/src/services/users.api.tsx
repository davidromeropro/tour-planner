import axios from 'axios';
const baseUrl = process.env.REACT_APP_USERS_API_BASE_URL;
const urls = {
	'login': {
		url: `${baseUrl}login`,
		method: 'post'
	},
	'logout': {
		url: `${baseUrl}logout`,
		method: 'post'
	},
	'register': {
		url: `${baseUrl}register`,
		method: 'post'
	},
	'find': {
		url: `${baseUrl}`,
		method: 'get'
	},
	'authenticated':{
		url: `${baseUrl}authenticated`,
		method: 'get'
	}
};

type ActionKey = keyof typeof urls;

export const usersApi = (action: ActionKey, data?: any, param?: string, url?: string) => {
	const config = urls[action];
	axios.defaults.withCredentials = true;
	return axios({
		method: config.method,
		url: url || `${config.url}${param || ''}`,
		data: data
	});
}

