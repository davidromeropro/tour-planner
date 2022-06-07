import { useState } from 'react';
import * as Yup from 'yup';
import { useForm, yupResolver } from '@mantine/form';
import {
	Image,
	Text,
	NumberInput,
	TextInput,
	Button,
	Group,
	Select,
	Textarea,
	SimpleGrid,
	Box,
	ActionIcon,
	createStyles,
	ScrollArea
} from '@mantine/core';
import { activitiesApi } from '../../services/activities.api';
import { s3Api } from '../../services/s3.api';
import { useNavigate, useParams } from 'react-router-dom';
import { activityTypes, regions, daysInWeek, dateRangesOverlap, availabilityToDateRanges } from '../../utilities/ActivityUtilities';
import { errorHandler } from '../../utilities/ErrorHandler';
import { useEffect } from 'react';
import { ObjectID } from 'bson';
import { Trash } from 'tabler-icons-react';

import { Photo, X } from 'tabler-icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { randomId } from '@mantine/hooks';
import { TimeInput } from '@mantine/dates';

const schema = Yup.object().shape({
	name: Yup.string().min(3, 'Name should have at least 2 letters'),
	description: Yup.string().min(
		3,
		'Description should have at least 2 letters'
	),
	type: Yup.string().required('Type is required'),
});

export const dropzoneChildren = () => (
	<Group
		position='center'
		spacing='xl'
		style={{ minHeight: 150, pointerEvents: 'none' }}
	>
		<Photo size={80} />

		<div>
			<Text size='xl' inline>
				Drag an image here or click to select the file
			</Text>
			<Text size='sm' color='dimmed' inline mt={7}>
				Attach only one image and the file should not exceed 5mb
			</Text>
		</div>
	</Group>
);

const useStyles = createStyles((theme) => ({
	footer: {

	},
	form: {
		marginBottom: 50
	}
}));

export const ActivityForm = () => {
	const { classes } = useStyles();

	const [showImageUpload, setShowImageUpload] = useState(false);
	// If 'id' has a value this component will update an player otherwise, it will create an player.
	const { id } = useParams();

	const navigate = useNavigate();

	const now = new Date();
	const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30);
	const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 30);

	const form = useForm({
		schema: yupResolver(schema),
		initialValues: {
			name: '',
			description: '',
			type: '',
			price: 0,
			image: '',
			region: '',
			location: '',
			contact: '',
		},
	});

	type FormValues = typeof form.values;

	const [availability, setAvailability] = useState<{ day: string, startTime: Date, endTime: Date, _id: any, key: string }[]>([{ day: '1', startTime, endTime, _id: new ObjectID(), key: randomId() }]);

	useEffect(() => {
		id &&
			(async () => {
				try {
					const res = await activitiesApi('find', null, id);
					const { activity } = res.data as any;
					setShowImageUpload(activity.image !== '');
					const { availability } = activity;
					setAvailability(availability);
					form.setValues({
						name: activity.name,
						description: activity.description,
						type: activity.type,
						price: activity.price,
						image: activity.image,
						region: activity.region,
						location: activity.location,
						contact: activity.contact,
					} as FormValues);
				} catch (error) {
					errorHandler(error) && navigate('/');
				}
			})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleSubmit = async (activity: FormValues) => {
		try {
			// check if there is a range of dates that are overlapping in availability
			const dateRanges = availabilityToDateRanges(availability);
			const isOverlapping = dateRangesOverlap(dateRanges);
			if (isOverlapping) {
				throw new Error('There is a range of dates that are overlapping in availability');
			}
			const result = { ...activity, availability };
			await activitiesApi(id ? 'update' : 'create', result, id);
			// clean form
			form.reset();
			navigate('/main/activities');
		} catch (error) {
			errorHandler(error) && navigate('/');
		}
	};

	const handleCancel = () => {
		form.reset();
		navigate('/main/activities');
	};

	return (
		<form className={classes.form} onSubmit={form.onSubmit((values) => handleSubmit(values))}>
			<SimpleGrid
				cols={2}
				spacing='lg'
				breakpoints={[
					{ maxWidth: 980, cols: 2, spacing: 'md' },
					{ maxWidth: 755, cols: 2, spacing: 'sm' },
					{ maxWidth: 600, cols: 1, spacing: 'sm' },
				]}
			>
				<Box px='md'>
					{!showImageUpload ? <Dropzone
						multiple={false}
						onDrop={async (files) => {
							// Get a secure url from the server
							const res = await s3Api('getUrl', files[0]);
							console.log('res', res);
							const { uploadUrl } = res.data as any;
							console.log('uploadUrl', uploadUrl);
							// Post the image to the s3 bucket
							await fetch(uploadUrl, {
								method: 'PUT',
								headers: {
									'Content-Type': 'multipart/form-data'
								},
								body: files[0]
							});
							const imageUrl = uploadUrl.split('?')[0];
							setShowImageUpload(true);
							form.setFieldValue('image', imageUrl);
						}}
						onReject={(files) => console.log('rejected files', files)}
						maxSize={3 * 1024 ** 2}
						accept={IMAGE_MIME_TYPE}
					>
						{() => dropzoneChildren()}
					</Dropzone> :
						<Group position='center' mt='md'>
							<Image
								radius='md'
								src={form.values.image}
								alt='activity'
							/>
							<ActionIcon
								onClick={() => setShowImageUpload(false)}
							>
								<X size={20}>/</X>
							</ActionIcon>
						</Group>
					}
					<TextInput
						required
						label='Name'
						placeholder='Name'
						mt='sm'
						{...form.getInputProps('name')}
					/>
					<Textarea
						required
						label='Description'
						placeholder='Description'
						mt='sm'
						{...form.getInputProps('description')}
						autosize
						minRows={2}
					/>
					<Group>
						<Select
							required
							label='Activity Type'
							placeholder='Select an activity type'
							mt='sm'
							sx={{ flex: 1 }}
							data={activityTypes}
							{...form.getInputProps('type')}
						/>
						<Select
							required
							label='Region'
							placeholder='Select an activity type'
							mt='sm'
							sx={{ flex: 1 }}
							data={regions}
							{...form.getInputProps('region')}
						/>
						<NumberInput
							required
							label='Price'
							mt='sm'
							precision={2}
							min={0}
							sx={{ flex: 1 }}
							parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
							formatter={(value) => `$ ${value}`}
							{...form.getInputProps('price')}
						/>
					</Group>
					<Textarea
						label='Contact'
						placeholder='Contact'
						mt='sm'
						{...form.getInputProps('contact')}
						autosize
						minRows={2}
					/>
				</Box>
				<Box px='md'>
					<ScrollArea style={{ height: '95%' }} offsetScrollbars>
						<Group position='apart' mt='md' mb='md'>
							<Text>
								Availability
							</Text>
							<Button
								onClick={() => setAvailability([
									...availability,
									{ day: '1', startTime, endTime, _id: new ObjectID(), key: randomId() },
								])
								}
							>
								Add availability
							</Button>
						</Group>
						{availability.length > 0 ? (
							<Group mb='xs'>
								<Text weight={500} size='sm' sx={{ flex: 1 }}>
									Day
								</Text>
								<Text weight={500} size='sm' sx={{ flex: 1 }}>
									StartTime
								</Text>
								<Text weight={500} size='sm' sx={{ flex: 1 }}>
									EndTime
								</Text>
							</Group>
						) : (
							<Text color='dimmed' align='center'>
								No records...
							</Text>
						)}
						{availability.map((item, index) => (
							<Group key={item.key} mt='xs'>
								<Select
									required
									sx={{ flex: 1 }}
									placeholder='Select a day'
									data={daysInWeek}
									value={item.day}
									onChange={(val) => {
										let newAvailability = [...availability];
										newAvailability[index].day = val as string;
										setAvailability(newAvailability);
									}}
								/>
								<TimeInput
									placeholder='Start Time'
									required
									sx={{ flex: 1 }}
									value={new Date(item.startTime)}
									onChange={(val) => {
										let newAvailability = [...availability];
										newAvailability[index].startTime = val;
										setAvailability(newAvailability);
									}}
								/>
								<TimeInput
									placeholder='End Time'
									required
									sx={{ flex: 1 }}
									value={new Date(item.endTime)}
									onChange={(val) => {
										let newAvailability = [...availability];
										newAvailability[index].endTime = val;
										setAvailability(newAvailability);
									}}
								/>
								<ActionIcon
									color='red'
									variant='hover'
									onClick={() => setAvailability([
										...availability.filter((i) => i._id !== item._id),
									])}
									mr='sm'					>
									<Trash size={16} />
								</ActionIcon>
							</Group>
						))}
					</ScrollArea>
				</Box>
			</SimpleGrid>
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
				<Group position='right' spacing='lg' mx='xl' my='sm'  >
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
					>
						{id ? 'Edit' : 'Create'}
					</Button>
				</Group>
			</Box>
		</form>
	);
};
