import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { Sun, MoonStars } from 'tabler-icons-react';

export const LightDarkButton = () => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === 'dark';

	return (
		<div>
			<Tooltip label={'Toggle theme'}>
				<ActionIcon
					// color={dark ? 'yellow' : 'blue'}
					onClick={() => toggleColorScheme()}
				>
					{dark ? <Sun size={18} /> : <MoonStars size={18} />}
				</ActionIcon>
			</Tooltip>

		</div>
	)
}
