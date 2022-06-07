import * as Yup from 'yup';
import { useForm, yupResolver } from '@mantine/form';
import { TextInput, Button, Box, PasswordInput } from '@mantine/core';
import { usersApi } from '../../services/users.api';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'tabler-icons-react';
import { errorHandler } from '../../utilities/ErrorHandler';
import { useEffect } from 'react';

const schema = Yup.object().shape({
	email: Yup.string().email('Invalid email'),
	password: Yup.string().required('Password is required')
});

interface User { email: string; password: string; }

export const LoginForm = () => {

	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const userId = JSON.parse(window.localStorage.getItem('userId') as string);
				const { data: { isAuthenticated } } = await usersApi('authenticated');
				isAuthenticated && userId && navigate('/main');
			} catch (error) {
				navigate('/');
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const form = useForm({
		schema: yupResolver(schema),
		initialValues: {
			email: '',
			password: ''
		}
	});

	const handleSubmit = async (user: User) => {
		try {
			const { data: { id } } = await usersApi('login', user);
			window.localStorage.setItem('userId', JSON.stringify(id));
			// clean form
			form.reset();
			navigate('/main');
		} catch (error) {
			errorHandler(error);
		}
	}

	return (
		<Box sx={{ maxWidth: 340 }} mx='auto'>
			<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
				<TextInput
					required
					label='Email address'
					placeholder='example@mail.com'
					size='md'
					icon={<Mail size={14} />}
					{...form.getInputProps('email')}
				/>
				<PasswordInput
					required
					label='Password'
					placeholder='Password'
					mt='md'
					size='md'
					icon={<Lock size={14} />}
					{...form.getInputProps('password')}
				/>
				<Button fullWidth mt='xl' size='md' type='submit'>Login</Button>
			</form>
		</Box>
	);
}