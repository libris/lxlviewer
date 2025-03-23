import Cookies from 'js-cookie';
import type { LibraryItem, UserSettings } from '$lib/types/userSettings';

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

interface UserSettingsState {
	value: UserSettings;
}

function createUserSettings() {
	const settings: UserSettingsState = $state({ value: {} }); // todo test remove value

	function init(s: UserSettings) {
		if (s) {
			settings.value = s;
		}
	}

	function update(namespace: keyof UserSettings, v: unknown) {
		settings.value[namespace] = v;

		const cookie = {
			...settings.value,
			...{ [namespace]: v }
		};
		setCookie(cookie);
	}

	function setCookie(value: unknown) {
		Cookies.set('userSettings', JSON.stringify(value), {
			expires: 365,
			secure: true,
			sameSite: 'strict'
		});
	}

	// function sortFacet() {

	// }

	function addLibrary(library: LibraryItem) {
		const myLibs = { ...userSettings?.myLibraries };
		if (!myLibs[library['@id']]) {
			myLibs[library['@id']] = library;
			update('myLibraries', myLibs);
		} else {
			console.log('already in my favs!');
		}
	}

	function removeLibrary(library: LibraryItem) {
		const myLibs = { ...userSettings?.myLibraries };
		if (myLibs[library['@id']]) {
			delete myLibs[library['@id']];
			update('myLibraries', myLibs);
		} else {
			console.log('could not remove. Lib not found in fav libs');
		}
	}

	return {
		get myLibraries() {
			return settings.value?.myLibraries || {};
		},
		get facetSort() {
			return settings.value?.facetSort;
		},
		init,
		// update,
		addLibrary,
		removeLibrary
	};
}

export const userSettings = createUserSettings();
