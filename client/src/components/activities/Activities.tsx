import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, createStyles, Table, ScrollArea, UnstyledButton, Group, Text, Center, TextInput, Button, Tooltip } from '@mantine/core';
import { Selector, ChevronDown, ChevronUp, Search, Pencil } from 'tabler-icons-react';
import { activitiesApi } from '../../services/activities.api';
import { errorHandler } from '../../utilities/ErrorHandler';
import { activityTypes, regions } from '../../utilities/ActivityUtilities';
import { DeleteButton } from '../../utilities/DeleteButton';

interface Activity { name: string; description: string; type: string;[key: string]: any; }
interface ActivityList {
	activities: Activity[];
}

const props = ['name', 'type', 'region', 'price'];

function filterData(data: Activity[], search: string) {
	const query = search.toLowerCase().trim();
	return data.filter((item) => (Object.keys(item)).some((key) => item[key].toString().toLowerCase().includes(query)));
}

function sortData(
	data: Activity[],
	payload: { sortBy: keyof Activity; reversed: boolean; search: string }
) {
	if (!payload.sortBy) {
		return filterData(data, payload.search);
	}

	return filterData(
		[...data].sort((a, b) => {
			if (payload.reversed) {
				if (isNaN(a[payload.sortBy])) {
					return b[payload.sortBy].localeCompare(a[payload.sortBy]);
				} else {
					return b[payload.sortBy] - a[payload.sortBy];
				}
			}
			if (isNaN(a[payload.sortBy])) {
				return a[payload.sortBy].localeCompare(b[payload.sortBy]);
			} else {
				return a[payload.sortBy] - b[payload.sortBy];
			}
		}),
		payload.search
	);
}

const useStyles = createStyles((theme) => ({
	th: {
		padding: '0 !important',
	},
	control: {
		width: '100%',
		padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},
	},
	icon: {
		width: 21,
		height: 21,
		borderRadius: 21,
	},
}));

interface ThProps {
	children: React.ReactNode;
	reversed: boolean;
	sorted: boolean;
	onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
	const { classes } = useStyles();
	const Icon = sorted ? (reversed ? ChevronUp : ChevronDown) : Selector;
	return (
		<th className={classes.th}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group position='apart'>
					<Text weight={'bold'} size='sm' transform='capitalize'>
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon size={14} />
					</Center>
				</Group>
			</UnstyledButton>
		</th>
	);
}

export const Activities= () => {
	const [data, setData] = useState<Activity[]>([]);
	const [sortedData, setSortedData] = useState(data);
	const [sortBy, setSortBy] = useState<keyof Activity>('name');
	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [search, setSearch] = useState('');
	const navigate = useNavigate();

	const setSorting = (field: keyof Activity) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(data, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
	};

	const handleDelete = async (id: string) => {
		try {
			await activitiesApi('delete', '', id);
			const result = data.filter((item) => item._id !== id);
			setData(result);
			setSortedData(result);
		} catch (error) {
			errorHandler(error) && navigate('/');
		}
	}

	const handleEdit = async (id: string) => {
		navigate(`/main/activities/edit/${id}`);
	}

	useEffect(() => {
		(async () => {
			try {
				const res = await activitiesApi('find');
				const { activities } = res.data as ActivityList;
				setData(activities);
				setSortedData(activities);
			} catch (error) {
				errorHandler(error) && navigate('/');
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const ths = (
		<tr>
			{props.map((prop) => (
				<Th
					key={prop}
					sorted={sortBy === prop}
					reversed={reverseSortDirection}
					onSort={() => setSorting(prop as keyof Activity)}
				>
					{prop}
				</Th>))}
			<th>Actions</th>
		</tr>
	);

	const rows = sortedData.map((row) => (
		<tr key={row._id}>
			<td>{row.name}</td>
			<td>{activityTypes.find(type => type.value === row.type)?.label}</td>
			<td>{regions.find(region => region.value === row.region)?.label}</td>
			<td>${row.price}</td>
			<td>
				<Group position='left'>
					<Tooltip label={'Edit'}>
						<ActionIcon
							// color='green'
							// variant='outline'
							onClick={() => handleEdit(row._id)}
						>
							<Pencil size={20} />
						</ActionIcon>
					</Tooltip>
					<DeleteButton
						msg={`Are you sure you want to delete the activity '${row.name}'?`}
						id={row._id}
						onDelete={handleDelete}
					></DeleteButton>
				</Group>
			</td>
		</tr>
	));

	return (
		<ScrollArea>
			<Group position='apart' mt='md'>
				<TextInput
					placeholder='Search by any field'
					mb='md'
					icon={<Search size={14} />}
					value={search}
					onChange={handleSearchChange}
				/>
				<Button
					mb='md'
					// variant='outline'
					onClick={() => navigate('/main/activities/new')}
				>
					Add Activity
				</Button>
			</Group>
			<Table horizontalSpacing="md" striped highlightOnHover>
				<thead>{ths}</thead>
				<tbody>{rows}</tbody>
			</Table>
		</ScrollArea>
	);
}
