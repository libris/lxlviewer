import Cookies from 'js-cookie';
import type { LibraryItem, UserSettings } from '$lib/types/userSettings';

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

	function update(setting: keyof UserSettings, v: unknown) {
		// if (true) check if setting namespace is allowed
		settings.value[setting] = v;

		const cookie = {
			...settings.value,
			...{ [setting]: v }
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
		// update,
		addLibrary,
		removeLibrary,
		saveFacetSort
	};
}

export const userSettings = createUserSettings();
