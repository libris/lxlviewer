import Cookies from 'js-cookie';
import type { UserSettingsType } from '$lib/types/userSettings';

// type UserState = {
// 	settings: UserSettings | null
// }

// export const userState: UserState = $state({ settings: null })

// export function saveUserSetting(namespace: 'facetSort' | 'myLibraries', value: { [dimension: string]: string }) {
// 	if (browser) {
// 		console.log('hello from save', value)
// 		const userSettings = Cookies.get('userSettings');
// 		let newSettings;

// 		if (userSettings) {
// 			try {
// 				const parsedSettings = JSON.parse(userSettings) as UserSettings;
// 				if (parsedSettings) {
// 					newSettings = {
// 						...parsedSettings,
// 						[namespace]: {
// 							...(namespace in parsedSettings && parsedSettings[namespace]),
// 							...value
// 						}
// 					};
// 				}
// 			} catch (e) {
// 				console.warn(e);
// 			}
// 		} else {
// 			newSettings = { [namespace]: value };
// 		}
// 		console.log('saving new settings', newSettings)
// 		Cookies.set('userSettings', JSON.stringify(newSettings), {
// 			expires: 365,
// 			secure: true,
// 			sameSite: 'strict'
// 		});
// 	}
// }

// class UserSettings {
// 	facetSort = $state({});
// 	myLibraries = $state({});
// 	name = $state('');

// 	constructor(settings: UserSettingsType) {
// 		// this.settings = settings;
// 		this.facetSort = settings?.facetSort || {};
// 		this.myLibraries = settings?.myLibraries || {};
// 		this.name = settings?.name || '';
// 	}

// 	set(value: UserSettingsType) {
// 		console.log('SET!', value)
// 		this.name = value.name;
// 		const cookie = value;
// 		setCookie(cookie)
// 	}

// 	get n() {
// 		return this.name;
// 	}

// 	update(namespace: string, value: unknown) {
// 		// this.facetSort = settings?.facetSort || {};
// 		// this.myLibraris = settings?.myLibraries || {};
// 		const cookie = {
// 			[namespace]: value
// 		}
// 		setCookie(cookie);
// 	}
// }

function UserSettings() {
	let settings: UserSettingsType | object = $state({});

	function init(s: UserSettingsType) {
		if (s) {
			settings = s;
		}
	}

	function update(namespace, value) {
		settings[namespace] = value;

		const cookie = {
			[namespace]: value
		}
		setCookie(cookie);
	}

	function setCookie(value: unknown) {
		Cookies.set('userSettings', JSON.stringify(value), {
			expires: 365,
			secure: true,
			sameSite: 'strict'
		});
	}

	return {
		get name() {
			return settings?.name;
		},
		init,
		update
	}
}

function createName() {
	// let name = userSettings.name;

	function setName(n: string) {
		userSettings.update('name', n)
		// name = n;
	}
	return {
		get is() {
			return userSettings.name
		},
		setName
	}
}

export const userSettings = UserSettings();
export const myName = createName();

