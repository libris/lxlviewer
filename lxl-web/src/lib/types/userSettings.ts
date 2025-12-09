import type { AvailableCitationFormat } from '$lib/types/citation';
import type { LibraryId } from './holdings';

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
};

export enum DebugFlags {
	ES_SCORE = 'esScore'
}
