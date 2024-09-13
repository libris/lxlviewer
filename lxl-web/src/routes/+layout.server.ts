import type { UserSettings } from '$lib/types/userSettings.js';

export async function load({ cookies }) {
	let userSettings: UserSettings;
	const settingsCookie = cookies.get('userSettings');
	if (settingsCookie) {
		try {
			userSettings = JSON.parse(settingsCookie);
		} catch (e) {
			console.warn('Failed to parse user settings', e);
		}
	}
	return {
		userSettings
	};
}
