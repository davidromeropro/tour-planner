import { ActionIcon, Text, Tooltip } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { Trash } from 'tabler-icons-react';

interface DeleteButtonProps {
	msg: string;
	id: string;
	icon?: React.ReactNode;
	onDelete: (id: string) => void;
}

export const DeleteButton = ({ msg, id, onDelete, icon=<Trash size={20} />}: DeleteButtonProps) => {
	const modals = useModals();

	const openDeleteModal = () =>
		modals.openConfirmModal({
			title: 'Delete',
			// centered: true,
			children: (
				<Text size="sm">
					{msg}
				</Text>
			),
			labels: { confirm: 'Delete', cancel: "Cancel" },
			confirmProps: { color: 'red' },
			// onCancel: () => console.log('Cancel'),
			onConfirm: () => onDelete(id),
		});

	return (<Tooltip label={'Delete'}>
		<ActionIcon
			// color='red'
			// variant='outline'
			onClick={openDeleteModal}
		>
			{icon}
		</ActionIcon>
	</Tooltip>);
}