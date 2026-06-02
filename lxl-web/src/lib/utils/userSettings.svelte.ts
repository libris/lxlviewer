import Cookies from 'js-cookie';
import {
	ExpandedState,
	type MyLibrariesType,
	SettingsParams,
	type UserSettings as UserSettingsType
} from '$lib/types/userSettings';
import type { AvailableCitationFormat } from '$lib/types/citation';
import type { LibraryId } from '$lib/types/holdings';
import { stripPrefix } from '$lib/utils/stripPrefix';
import { LIBRARY_URI_PREFIX } from '$lib/utils/holdings';

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

	private update<K extends keyof UserSettingsType>(key: K, value: UserSettingsType[K]) {
		this.settings = {
			...this.settings,
			[key]: value
		};

		this.setCookie(this.settings);
	}

	private setCookie(value: UserSettingsType) {
		Cookies.set('userSettings', JSON.stringify(value), {
			expires: 365,
			secure: true,
			sameSite: 'strict'
		});
	}

	addLibrary(libraryId: LibraryId) {
		const myLibs = { ...this.settings?.myLibraries };
		if (!myLibs[libraryId]) {
			myLibs[libraryId] = '';
			this.update('myLibraries', myLibs);
		}
	}

	removeLibrary(libraryId: string) {
		const myLibs = { ...this.settings?.myLibraries };

		if (Object.hasOwn(myLibs, libraryId)) {
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

	setPrefersNearMe(setting: boolean) {
		this.update('prefersNearMe', setting);
	}

	setDismissedNewBanner() {
		this.update('dismissedNewBanner', true);
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

	get prefersNearMe() {
		return this.settings.prefersNearMe;
	}

	get dismissedNewBanner() {
		return this.settings.dismissedNewBanner;
	}

	toURLSearchParams(): URLSearchParams {
		return toUrlSearchParams(this.settings);
	}
}

function toUrlSearchParams(userSettings: UserSettingsType): URLSearchParams {
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const p = new URLSearchParams();

	const libs = Object.keys(userSettings.myLibraries || {})
		.map((id) => stripPrefix(id, LIBRARY_URI_PREFIX))
		.join(',');
	p.set(SettingsParams.favouriteLibraries, libs);

	p.sort();
	return p;
}

export function updateSettings(
	userSettings: UserSettingsType,
	params: URLSearchParams,
	isValidLibrary: (id: string) => boolean
) {
	const setMyLibraries = params.get(SettingsParams.favouriteLibraries);
	if (setMyLibraries !== undefined && setMyLibraries !== null) {
		const myLibraries: MyLibrariesType = {};
		setMyLibraries
			.split(',')
			.map((s) => s.trim())
			.map((s) => LIBRARY_URI_PREFIX + s)
			.filter(isValidLibrary)
			.forEach((l) => (myLibraries[l] = ''));
		userSettings.myLibraries = myLibraries;
	}
}
