import { useEffect, useState } from 'react';
import {
	Routes,
	Route,
	Link,
	useNavigate
} from 'react-router-dom';
import {
	createStyles,
	AppShell,
	Header,
	Text,
	Burger,
	useMantineTheme,
	Transition,
	Paper,
	Group,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { LightDarkButton } from '../utilities/LightDarkButton';
import { ActivityForm } from './activities/ActivityForm';
import { Activities } from './activities/Activities';
import { Tours } from './tours/Tours';

import { useBooleanToggle } from '@mantine/hooks';
import { Logout } from 'tabler-icons-react';
import { usersApi } from '../services/users.api';
import { errorHandler } from '../utilities/ErrorHandler';
import { TourActivities } from './tourActivities/TourActivities';

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
	root: {
		position: 'relative',
		zIndex: 1,
	},

	dropdown: {
		position: 'absolute',
		top: HEADER_HEIGHT,
		left: 0,
		right: 0,
		zIndex: 0,
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,
		borderTopWidth: 0,
		overflow: 'hidden',

		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},

	burger: {
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},

	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
	},

	links: {
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},

	link: {
		display: 'block',
		lineHeight: 1,
		padding: '8px 12px',
		borderRadius: theme.radius.sm,
		textDecoration: 'none',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
		fontSize: theme.fontSizes.sm,
		fontWeight: 500,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},

		[theme.fn.smallerThan('sm')]: {
			lineHeight: 2,
			borderRadius: 0,
			padding: theme.spacing.md,
		},
	},

	linkActive: {
		'&, &:hover': {
			backgroundColor:
				theme.colorScheme === 'dark'
					? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
					: theme.colors[theme.primaryColor][0],
			color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 3 : 7],
		},
	},
}));

export const Main = () => {
	const theme = useMantineTheme();
	const [opened, toggleOpened] = useBooleanToggle(false);
	const [active, setActive] = useState(0);
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [user, setUser] = useState<{
		name: string,
		menus: { link: string, label: string }[],
		roles: string,
	}>({
		name: '',
		menus: [],
		roles: '',
	});

	useEffect(() => {
		(async () => {
			try {
				const userId = JSON.parse(window.localStorage.getItem('userId') as string);
				!userId && navigate('/');
				const { data } = await usersApi('find', null, userId);
				setUser(data);
			} catch (error) {
				errorHandler(error) && navigate('/');
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleLogout = async () => {
		try {
			await usersApi('logout');
			window.localStorage.removeItem('userId');
			navigate('/');
		} catch (error) {
			errorHandler(error);
		}
	};

	const items = user.menus.map((link, index) => (
		<Text
			component={Link}
			to={link.link}
			key={link.label}
			className={cx(classes.link, { [classes.linkActive]: index === active })}
			onClick={() => {
				setActive(index);
				toggleOpened(false);
			}}
		>
			{link.label}
		</Text>
	));

	return (
		<AppShell
			styles={{
				main: {
					background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
				},
			}}
			navbarOffsetBreakpoint='sm'
			fixed
			header={
				<Header height={70} p='md'>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
						<Burger
							opened={opened}
							onClick={() => toggleOpened()}
							size="sm"
							className={classes.burger}
						/>
						<Transition transition="pop-top-right" duration={200} mounted={opened}>
							{(styles) => (
								<Paper className={classes.dropdown} withBorder style={styles}>
									{items}
								</Paper>
							)}
						</Transition>
						<Group spacing={5} className={classes.links}>
							{items}
						</Group>
						<Group spacing={20} >
							<Group spacing={'sm'} >
								<Text size='md'>{user.name}</Text>
								<Text size='md'>({user.roles})</Text>
							</Group>
							<Tooltip label={'Logout'}>
								<ActionIcon
								// color='red'
								onClick={() => handleLogout()}
								>
									<Logout size={20} />
								</ActionIcon>
							</Tooltip>
							<LightDarkButton></LightDarkButton>
						</Group>
					</div>
				</Header>
			}
		>
			<Routes>
				<Route path='activities' element={<Activities />} />
				<Route path='activities/new' element={<ActivityForm />} />
				<Route path='activities/edit/:id' element={<ActivityForm />} />
				<Route path='tours' element={<Tours />} />
				<Route path='tourActivities/edit/:id' element={<TourActivities />} />
				<Route path='tourActivities' element={<TourActivities />} />
			</Routes>
		</AppShell>
	);
}
