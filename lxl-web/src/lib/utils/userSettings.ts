import Cookies from 'js-cookie';
import { browser } from '$app/environment';
import type { UserSettings } from '$lib/types/userSettings';

export function saveUserSetting(
	namespace: 'facetSort' | 'myLibraries',
	value: { [key: string]: string }
) {
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
		Cookies.set('userSettings', JSON.stringify(newSettings), {
			expires: 365,
			secure: true,
			sameSite: 'strict'
		});
	}
}

export function removeUserSetting(namespace: 'myLibraries', keyToRemove: string) {
	if (browser) {
		const userSettings = Cookies.get('userSettings');
		let newSettings;

		if (userSettings) {
			try {
				const parsedSettings = JSON.parse(userSettings) as UserSettings;
				if (parsedSettings && namespace in parsedSettings) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { [keyToRemove]: removedKey, ...newNameSpaceObj } = parsedSettings[namespace];
					newSettings = {
						...parsedSettings,
						[namespace]: newNameSpaceObj
					};
				}
			} catch (e) {
				console.warn(e);
			}
			Cookies.set('userSettings', JSON.stringify(newSettings), {
				expires: 365,
				secure: true,
				sameSite: 'strict'
			});
		}
	}
}
