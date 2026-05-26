import type { AvailableCitationFormat } from '$lib/types/citation';
import type { LibraryId } from './holdings';

// label string is obsolete and not used
export type MyLibrariesType = Record<LibraryId, string>;

export enum ExpandedState {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED'
}

export type UserSettings = {
	facetSort?: {
		[dimension: string]: string;
	};
	facetExpanded?: {
		[dimension: string]: ExpandedState;
	};
	myLibraries?: MyLibrariesType;
	leadingPane?: {
		width?: number;
		open?: boolean;
	};
	selectedCitationFormat?: AvailableCitationFormat | 'all';
	trailingPane?: {
		width?: number;
	};
	debug?: DebugFlags[];
	prefersNearMe?: boolean;
	dismissedNewBanner?: boolean;
};

export enum DebugFlags {
	ES_SCORE = 'esScore'
}

export enum SettingsParams {
	wipeSettings = 'wipeSettings',
	favouriteLibraries = 'favouriteLibraries'
}
