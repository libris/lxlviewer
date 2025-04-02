import Cookies from 'js-cookie';
import type { LibraryItem, UserSettings as UserSettingsType } from '$lib/types/userSettings';

enum availableSettings {
	facetSort = 'facetSort',
	myLibraries = 'myLibraries'
}

export class UserSettings {
	private settings: UserSettingsType = $state({});

	constructor(settings: UserSettingsType) {
		this.settings = settings;
	}

	private update(setting: keyof typeof availableSettings, v: Partial<UserSettings>) {
		if (setting in availableSettings) {
			const settingsObj = {
				...this.settings,
				...{ [setting]: v }
			};

			this.settings = settingsObj;
			this.setCookie(settingsObj);
		}
	}

	private setCookie(value: UserSettingsType) {
		Cookies.set('userSettings', JSON.stringify(value), {
			expires: 365,
			secure: true,
			sameSite: 'strict'
		});
	}

	addLibrary(library: LibraryItem) {
		const myLibs = { ...this.settings?.myLibraries };
		if (!myLibs[library['@id']]) {
			myLibs[library['@id']] = library;
			this.update('myLibraries', myLibs);
		}
	}

	removeLibrary(libraryId: string) {
		const myLibs = { ...this.settings?.myLibraries };
		if (myLibs[libraryId]) {
			delete myLibs[libraryId];
			this.update('myLibraries', myLibs);
		}
	}

	saveFacetSort(facet: string, value: string) {
		if (facet && value) {
			const facetSort = { ...this.settings.facetSort };
			facetSort[facet] = value;
			this.update('facetSort', facetSort);
		}
	}

	get myLibraries() {
		return this.settings?.myLibraries;
	}

	get facetSort() {
		return this.settings?.facetSort;
	}
}
