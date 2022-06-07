import axios from 'axios';
const baseUrl = process.env.REACT_APP_S3_API_BASE_URL;
const urls = {
	'getUrl': {
		url: `${baseUrl}getUrl`,
		method: 'get'
	}
};

type ActionKey = keyof typeof urls;

export const s3Api = (action: ActionKey, data?: any, param?: string, url?: string) => {
	const config = urls[action];
	axios.defaults.withCredentials = true;
	return axios({
		method: config.method,
		url: url || `${config.url}${param || ''}`,
		data: data
	});
}