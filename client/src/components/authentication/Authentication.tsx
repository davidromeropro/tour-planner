import { useState } from 'react';
import {
	Paper,
	createStyles,
	Title,
	Text,
	Modal
} from '@mantine/core';
import { LightDarkButton } from '../../utilities/LightDarkButton';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

const useStyles = createStyles((theme) => ({
	wrapper: {
		minHeight: 900,
		backgroundSize: 'cover',
		backgroundImage:
			'url(https://images.unsplash.com/photo-1600074169098-16a54d791d0d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1744&q=80)',
	},

	form: {
		borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
			}`,
		minHeight: 900,
		maxWidth: 450,
		paddingTop: 80,

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			maxWidth: '100%',
		},
	},

	title: {
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
	},

	logo: {
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		width: 120,
		display: 'block',
		marginLeft: 'auto',
		marginRight: 'auto',
	},
}));

export const Authentication = () => {
	const { classes } = useStyles();
	const [opened, setOpened] = useState(false);

	return (

		<div className={classes.wrapper}>
			<Paper className={classes.form} radius={0} p={30}>
				<LightDarkButton></LightDarkButton>
				<Title order={2} className={classes.title} align='center' mt='md' mb={50}>
					Welcome back to Tour Planner!
				</Title>
				<LoginForm></LoginForm>
				<Text align='center' mt='md'>
					Don&apos;t have an account?{' '}
					<Text variant='link' weight={700} onClick={() => setOpened(true)}>
						Register
					</Text>
				</Text>
				<Modal
					opened={opened}
					onClose={() => setOpened(false)}
					title='Introduce yourself!'
				>
					<RegisterForm></RegisterForm>
				</Modal>
			</Paper>
		</div>
	);
}
