import { showNotification } from '@mantine/notifications';
import { AxiosError } from 'axios';
import { X } from 'tabler-icons-react';


export const errorHandler = (err: unknown | any) => {
	console.log('err', err);
	let message = '';
	if (err instanceof AxiosError) {
		let { msg, error } = err.response?.data;
		// Get the errors from the response
		const errorResponse = error?.errors;
		// Loop through all errors and get the messages
		const errorArr = errorResponse && Object.keys(errorResponse).map((key) => errorResponse[key].message).join(', ');
		// Set Errors
		message = errorArr ? errorArr : msg;
	} else {
		if(err instanceof Error){
			message = err.message;
		}
	}
	if (message) {
		showNotification({
			title: 'Error',
			autoClose: 10000,
			message: message,
			color: 'red',
			icon: <X />
		});
	} else {
		console.log('error', err);
	}
	return err.response?.status === 401;
}