import { ActionIcon, Button, Container, Group, Modal, NumberInput, NumberInputHandlers, Select, SimpleGrid, TextInput, Timeline, Avatar, Box, Spoiler } from '@mantine/core'
import { DateRangePicker } from '@mantine/dates'
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'tabler-icons-react';
import { dateRangeOverlap, activityTypes, regions } from '../../utilities/ActivityUtilities';
import {
	Card,
	Image,
	Text,
	Badge,
	createStyles,
} from '@mantine/core';
import { activitiesApi } from '../../services/activities.api';
import { toursApi } from '../../services/tours.api';
import { errorHandler } from '../../utilities/ErrorHandler';
import { useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { DeleteButton } from '../../utilities/DeleteButton';
import { ObjectID } from 'bson';

const useStyles = createStyles((theme) => ({
	card: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
	},


	title: {
		fontWeight: 700,
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
		lineHeight: 1.2,
	},

	body: {
		padding: theme.spacing.md,
	},

	section: {
		borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
			}`,
		paddingLeft: theme.spacing.md,
		paddingRight: theme.spacing.md,
		paddingBottom: theme.spacing.md,
	},

	like: {
		color: theme.colors.red[6],
	},

	label: {
		textTransform: 'uppercase',
		fontSize: theme.fontSizes.xs,
		fontWeight: 700,
	},
}));

const searchableFields = ['name', 'type', 'region', 'price'];

export const TourActivities = () => {
	// If 'id' has a value this component will update an player otherwise, it will create an player.
	const { id } = useParams();

	const { classes } = useStyles();
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		new Date(),
		dayjs(new Date()).add(5, 'days').toDate(),
	]);
	const navigate = useNavigate();
	const [guests, setGuests] = useState(1);
	const handlers = useRef<NumberInputHandlers>() as React.MutableRefObject<NumberInputHandlers>;
	const [opened, setOpened] = useState(false);
	const [activities, setActivities] = useState<any[]>([]);
	const [tourActivities, setTourActivities] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [filteredData, setFilteredData] = useState(activities);

	useEffect(() => {
		id &&
			(async () => {
				try {
					const res = await toursApi('findTourActivities', null, id);
					const { tour } = res.data as any;
					setGuests(tour.guests);
					const tourActivities = tour.activities.map((tourActivity: any) => {
						const { _id, ...rest } = tourActivity;
						return {
							...rest,
							..._id,
							startTime: new Date(tourActivity.startTime),
							endTime: new Date(tourActivity.endTime),
						};
					});
					// Order tour activities by start time
					tourActivities.sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime());
					setTourActivities(tourActivities);
					setDateRange([new Date(tour.startDate), new Date(tour.endDate)]);
				} catch (error) {
					errorHandler(error) && navigate('/');
				}
			})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);


	const getActivities = async () => {
		try {
			const param = `${dateRange[0]?.getTime()}/${dateRange[1]?.getTime()}`;
			const { data: { activities } } = await activitiesApi('find', null, param);
			if (activities.length > 0) {
				setActivities(activities);
				setFilteredData(activities);
				setOpened(true);
			} else {
				showNotification({
					title: 'We notify you that',
					autoClose: 5000,
					message: 'There are no activities available for this date range',
				});
			}
		} catch (error) {
			errorHandler(error) && navigate('/');
		}
	}

	const handleAddToTour = (activity: any) => {
		// Check if book date is selected
		if (activity.startTime && activity.endTime) {
			// Check if activity is already in tour
			const isInTour = tourActivities.find((tourActivity: any) => tourActivity._id === activity._id && tourActivity.startTime.getTime() === activity.startTime.getTime() && tourActivity.endTime.getTime() === activity.endTime.getTime());
			if (isInTour) {
				showNotification({
					title: 'We notify you that',
					autoClose: 5000,
					message: 'Activity is already in tour',
				});
			} else {
				// Check if activity overlaps with another activity in tour
				const isOverlapping = tourActivities.find((tourActivity: any) =>
					dateRangeOverlap(activity.startTime, activity.endTime, tourActivity.startTime, tourActivity.endTime)
				);
				if (isOverlapping) {
					showNotification({
						title: 'We notify you that',
						autoClose: 5000,
						message: 'Activity overlaps with another activity in tour',
					});
				} else {
					const newTourActivities = [...tourActivities, {...activity}];
					// Order tour activities by start time
					newTourActivities.sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime());
					setTourActivities(newTourActivities);
					console.log('newTourActivities', newTourActivities);
					setOpened(false);
				}
			}
		} else {
			showNotification({
				title: 'We notify you that',
				autoClose: 5000,
				message: 'You must select a date to book this activity',
			});
		}
	}

	const handleDelete = (activity: any) => {
		const newTourActivities = tourActivities.filter((tourActivity: any) => tourActivity._id !== activity._id && tourActivity.startTime.getTime() !== activity.startTime.getTime() && tourActivity.endTime.getTime() !== activity.endTime.getTime());
		setTourActivities(newTourActivities);
	}

	const handleCancel = () => {
		setTourActivities([]);
		navigate('/main/tours');
	};

	function filterData(data: any[], search: string) {
		const query = search.toLowerCase().trim();
		return data.filter((item) =>
			searchableFields.some((key) => {
				return item[key].toString().toLowerCase().includes(query);
			})
		);
	}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setFilteredData(filterData(activities, search));
	};

	const handleSubmit = async () => {
		try {
			const userId = JSON.parse(window.localStorage.getItem('userId') as string);
			const tour = {
				createdBy: ObjectID.createFromHexString(userId),
				guests,
				startDate: dateRange[0],
				endDate: dateRange[1],
				totalPrice: tourActivities.reduce((acc, curr) => acc + curr.price, 0)*guests,
				activities: tourActivities,
			};
			if (id) {
				await toursApi('update', tour, id);
			} else {
				await toursApi('create', tour);
			}
			showNotification({
				title: 'We notify you that',
				autoClose: 5000,
				message: `Tour has been ${ id ? 'edited ': 'created'}`,
			});
			navigate('/main/tours');
		} catch (error) {
			errorHandler(error) && navigate('/');
		}
	}

	return (
		<Container>
			<Group position="apart" sx={{ alignItems: 'end' }}>
				<DateRangePicker
					label="Select Dates"
					required
					placeholder="Pick dates range"
					minDate={new Date()}
					value={dateRange}
					onChange={setDateRange}
					clearable={false}
					sx={{ flex: 2 }}
				/>
				<Group spacing={5} sx={{ flex: 2, alignItems: 'end' }}>
					<ActionIcon
						size={37}
						variant="default"
						sx={{ flex: 1 }}
						onClick={() => handlers.current.decrement()}>
						–
					</ActionIcon>
					<NumberInput
						required
						label="Guests"
						hideControls
						value={guests}
						onChange={(val) => setGuests(val as number)}
						handlersRef={handlers}
						min={1}
						step={1}
						sx={{ flex: 2 }}
						styles={{ input: { textAlign: 'center' } }}
					/>
					<ActionIcon
						size={37}
						variant="default"
						sx={{ flex: 1 }}
						onClick={() => handlers.current.increment()}>
						+
					</ActionIcon>
				</Group>
				<Button
					sx={{ flex: 1 }}
					onClick={() => getActivities()}
				>
					Add Activity
				</Button>
			</Group>
			<Timeline mt='md' active={tourActivities.length} bulletSize={20} lineWidth={4} mb={'200px'}>
				{tourActivities.map((activity: any, index: number) => (
					<Timeline.Item key={index} title={`${dayjs(activity.startTime).format('dddd DD')}, ${dayjs(activity.startTime).format('h:mm A')}-${dayjs(activity.endTime).format('h:mm A')}`}>
						<Card withBorder radius="md" p={0} className={classes.card}>
							<Group noWrap spacing={0}>
								<Avatar sx={{
									'&:hover': {
										transform: 'scale(1.03)',
									}
								}} src={activity.image} size={200} />
								<Box className={classes.body}>
									<Group position="apart">
										<Text size="lg" weight={500}>
											{activity.name}
										</Text>
										<Group position="apart">
											<Badge size="sm">{activityTypes.find(type => type.value === activity.type)?.label}</Badge>
											<Badge size="sm">{regions.find(region => region.value === activity.region)?.label}</Badge>
										</Group>
										<DeleteButton
											msg={`Are you sure you want to delete the activity '${activity.name}'?`}
											id={activity._id}
											onDelete={() => handleDelete(activity)}
											icon={<X />}
										></DeleteButton>
									</Group>
									<Text size="sm" mt="xs">
										<Spoiler mt="xs" maxHeight={40} showLabel="Show more" hideLabel="Hide">
											{activity.description}
										</Spoiler>
									</Text>
									<Group noWrap position="right">
										<Badge
											mt="mb"
											size="xl"
										>
											${activity.price * guests}
										</Badge>
									</Group>
								</Box>
							</Group>
						</Card>
					</Timeline.Item>
				))}
			</Timeline>
			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title="Start your adventure!"
				overflow="inside"
				transition='rotate-left'
				size="full"
			>
				<TextInput
					placeholder='Search by name'
					mb='md'
					value={search}
					onChange={handleSearchChange}
					icon={<Search size={14} />}
				/>
				<SimpleGrid cols={3}
					spacing='lg'
					breakpoints={[
						{ maxWidth: 980, cols: 2, spacing: 'md' },
						{ maxWidth: 755, cols: 2, spacing: 'sm' },
						{ maxWidth: 600, cols: 1, spacing: 'sm' },
					]}
				>
					{filteredData.map((activity, index) => (
						<Card key={index} withBorder radius="md" p="md" className={classes.card}>
							<Card.Section>
								<Image sx={{
									'&:hover': {
										transform: 'scale(1.03)',
									}
								}} src={activity.image} alt={'activity picture'} height={120} />
							</Card.Section>
							<Card.Section className={classes.section} mt="md">
								<Text size="lg" weight={500}>
									{activity.name}
								</Text>
								<Group position="apart" mt="md">
									<Badge size="sm">{activityTypes.find(type => type.value === activity.type)?.label}</Badge>
									<Badge size="sm">{regions.find(region => region.value === activity.region)?.label}</Badge>
								</Group>
								<Spoiler mt="xs" maxHeight={50} showLabel="Show more" hideLabel="Hide">
									{activity.description}
								</Spoiler>
							</Card.Section>
							<Card.Section className={classes.section}>
								<Select
									mt="md"
									placeholder="Pick a date"
									onChange={(value: string) => {
										const data = value.split('_');
										const startTime = new Date(parseInt(data[0]));
										const endTime = new Date(parseInt(data[1]));
										// Update Start Time and End Time
										setFilteredData([...activities.slice(0, index), { ...activity, startTime, endTime }, ...activities.slice(index + 1)]);
										console.log('activities', activities);
									}}
									data={activity.activityAvailabilities}
								/>
							</Card.Section>
							<Card.Section className={classes.section}>
								<Group spacing={30}>
									<div>
										<Text
											mt="mb"
											size="xl"
											weight={700}
											sx={{ lineHeight: 1 }}>
											${activity.price}
										</Text>
										<Text size="sm" color="dimmed" weight={500} sx={{ lineHeight: 1 }} mt={3}>
											per guest
										</Text>
									</div>
									<Button
										mt="md"
										radius="xl"
										style={{ flex: 1 }}
										onClick={() => handleAddToTour(activity)}
									>
										Add now
									</Button>
								</Group>
							</Card.Section>
						</Card>))
					}
				</SimpleGrid>
			</Modal>
			<Box sx={(theme) => ({
				backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
				position: 'fixed',
				bottom: 0,
				left: '0',
				width: '100%',
				borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
					}`,
			})}
			>
				<Group position='apart'>
				<Text
						mt="mb"
						size="xl"
						mx='sm'
						weight={700}
						sx={{ lineHeight: 1 }}>
						Total Price: ${tourActivities.reduce((acc, curr) => acc + curr.price, 0)*guests}
					</Text>
					<Group position='right' spacing='lg' mx='sm' my='sm' >
					<Button
						variant='default'
						// color='gray'
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						// variant='outline'
						type='submit'
						onClick={handleSubmit}
					>
						{id ? 'Edit ' : 'Save '}Tour
					</Button>
				</Group>
				</Group>
				
			</Box>
		</Container>
	)
}
