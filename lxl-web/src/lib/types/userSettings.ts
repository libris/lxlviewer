import type { AvailableCitationFormat } from '#lib/types/citation.js';
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
	selectedCitationFormat?: AvailableCitationFormat;
	trailingPane?: {
		width?: number;
		open?: boolean;
	};
	debug?: DebugFlags[];
	prefersNearMe?: boolean;
	selectableResults?: boolean;
};

export enum DebugFlags {
	ES_SCORE = 'esScore'
}

export enum SettingsParams {
	favouriteLibraries = 'favouriteLibraries'
}
