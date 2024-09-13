import Cookies from 'js-cookie';
import { browser } from '$app/environment';
import type { UserSettings } from '$lib/types/userSettings';

export function saveUserSetting(namespace: 'facetSort', value: { [dimension: string]: string }) {
	if (browser) {
		const userSettings = Cookies.get('userSettings');
		let newSettings;

		if (userSettings) {
			try {
				const parsedSettings = JSON.parse(userSettings) as UserSettings;
				if (parsedSettings) {
					newSettings = {
						...parsedSettings,
						[namespace]: {
							...(namespace in parsedSettings && parsedSettings[namespace]),
							...value
						}
					};
				}
			} catch (e) {
				console.warn(e);
			}
		} else {
			newSettings = { [namespace]: value };
		}
		Cookies.set('userSettings', JSON.stringify(newSettings));
	}
}
