import Cookies from 'js-cookie';
import type { LibraryItem, UserSettings } from '$lib/types/userSettings';

interface UserSettingsState {
	value: UserSettings;
}

enum availableSettings {
	facetSort = 'facetSort',
	myLibraries = 'myLibraries'
}

function createUserSettings() {
	const settings: UserSettingsState = $state({ value: {} });

	function init(s: UserSettings) {
		if (s) {
			settings.value = s;
		}
	}

	function update(setting: keyof typeof availableSettings, v: Partial<UserSettings>) {
		if (setting in availableSettings) {
			const settingsValue = {
				...settings.value,
				...{ [setting]: v }
			};

			settings.value = settingsValue;
			setCookie(settingsValue);
		}
	}

	function setCookie(value: unknown) {
		Cookies.set('userSettings', JSON.stringify(value), {
			expires: 365,
			secure: true,
			sameSite: 'strict'
		});
	}

	function saveFacetSort(facet: string, value: string) {
		if (facet && value) {
			const facetSort = { ...userSettings.facetSort };
			facetSort[facet] = value;
			update('facetSort', facetSort);
		}
	}

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
		addLibrary,
		removeLibrary,
		saveFacetSort
	};
}

export const userSettings = createUserSettings();
