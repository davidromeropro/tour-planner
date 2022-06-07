import * as Yup from 'yup';
import { useForm, yupResolver } from '@mantine/form';
import { TextInput, Button, Box, Group, PasswordInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Mail, Lock } from 'tabler-icons-react';
import { usersApi } from '../../services/users.api';

const schema = Yup.object().shape({
	firstName: Yup.string().min(2, 'First name should have at least 2 letters'),
	lastName: Yup.string().min(2, 'Last name should have at least 2 letters'),
	email: Yup.string().email('Invalid email'),
	password: Yup.string().required('Password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], 'Passwords must match')
});

interface User {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	[key: string]: any;
}

export const RegisterForm = () => {
	const form = useForm({
		schema: yupResolver(schema),
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: ''
		}
	});

	const handleSubmit = async (user: User) => {
		try {
			await usersApi('register', user);
			// clean form
			form.reset();
			showNotification({
				title: 'You did great!',
				message: 'Data was saved successfully',
				color: 'green'
			});
		} catch (error) {
			console.log('error', error);
		}
	}

	return (
		<Box mx='auto'>
			<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
				<TextInput
					required
					label='First Name'
					placeholder='John'
					{...form.getInputProps('firstName')}
				/>
				<TextInput
					required
					label='Last Name'
					placeholder='Doe'
					mt='md'
					{...form.getInputProps('lastName')}
				/>
				<TextInput
					required
					label='Email'
					placeholder='example@mail.com'
					mt='md'
					icon={<Mail size={14} />}
					{...form.getInputProps('email')}
				/>
				<PasswordInput
					required
					label='Password'
					placeholder='Password'
					mt='md'
					icon={<Lock size={14} />}
					{...form.getInputProps('password')}
				/>
				<PasswordInput
					required
					label='Confirm password'
					placeholder='Confirm password'
					icon={<Lock size={14} />}
					mt='md'
					{...form.getInputProps('confirmPassword')}
				/>
				<Group position='right' mt='xl'>
					<Button type='submit'>Register</Button>
				</Group>
			</form>
		</Box>
	);
}