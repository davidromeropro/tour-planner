import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { Authentication } from './components/authentication/Authentication';
import { Main } from './components/Main';

function App() {

	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);
	return (
		<Router>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider theme={{ colorScheme, datesLocale: 'es-mx' }} withGlobalStyles withNormalizeCSS >
					<NotificationsProvider position='top-center'>
						<ModalsProvider>
							<Routes>
								<Route path="/" element={<Authentication />} />
								<Route path="/main/*" element={<Main />} />
							</Routes>
						</ModalsProvider>
					</NotificationsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</Router>
	);
}

export default App;
