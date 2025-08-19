import Cookies from 'js-cookie';
import {
	ExpandedState,
	type LibraryItem,
	type UserSettings as UserSettingsType
} from '$lib/types/userSettings';
import type { AvailableCitationFormat } from '$lib/types/citation';

enum availableSettings {
	facetSort = 'facetSort',
	myLibraries = 'myLibraries',
	leadingPane = 'leadingPane',
	facetExpanded = 'facetExpanded',
	selectedCitationFormat = 'selectedCitationFormat',
	trailingPane = 'trailingPane'
}

export class UserSettings {
	private settings: UserSettingsType = $state({});

	constructor(settings: UserSettingsType) {
		this.settings = settings;

		// set default
		if (!Object.prototype.hasOwnProperty.call(settings, 'leadingPane')) {
			this.settings = {
				...this.settings,
				...{ leadingPane: { open: true } }
			};
		}
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

	setLeadingPaneWidth(width: number) {
		const leadingPane = { ...this.settings?.leadingPane };
		leadingPane.width = width;
		this.update('leadingPane', leadingPane);
	}

	closeLeadingPane() {
		const leadingPane = { ...this.settings?.leadingPane };
		leadingPane.open = false;
		this.update('leadingPane', leadingPane);
	}

	openLeadingPane() {
		const leadingPane = { ...this.settings?.leadingPane };
		leadingPane.open = true;
		this.update('leadingPane', leadingPane);
	}

	setTrailingPaneWidth(width: number) {
		const trailingPane = { ...this.settings?.trailingPane };
		trailingPane.width = width;
		this.update('trailingPane', trailingPane);
	}

	saveFacetExpanded(facet: string, value: boolean) {
		if (facet) {
			const facetExpanded = { ...this.settings.facetExpanded };
			facetExpanded[facet] = value ? ExpandedState.OPEN : ExpandedState.CLOSED;
			this.update('facetExpanded', facetExpanded);
		}
	}

	saveSelectedCitationFormat(format: AvailableCitationFormat) {
		this.update('selectedCitationFormat', format);
	}
	get myLibraries() {
		return this.settings?.myLibraries;
	}

	get facetSort() {
		return this.settings?.facetSort;
	}

	get facetExpanded() {
		return this.settings?.facetExpanded;
	}

	get selectedCitationFormat() {
		return this.settings?.selectedCitationFormat;
	}
	get leadingPane() {
		return this.settings?.leadingPane;
	}

	get trailingPane() {
		return this.settings?.trailingPane;
	}
}
