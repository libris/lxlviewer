import { JsonLd } from './xl';

export interface LibraryItem {
	[JsonLd.ID]: string;
	label: string;
	sigel: string;
}

export enum ExpandState {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED'
}

export type UserSettings = {
	facetSort?: {
		[dimension: string]: string;
	};
	facetExpanded?: {
		[dimension: string]: ExpandState;
	};
	myLibraries?: {
		[id: string]: LibraryItem;
	};
	leadingPane?: {
		width?: number;
		open?: boolean;
	};
	debug?: DebugFlags[];
};

export enum DebugFlags {
	ES_SCORE = 'esScore'
}
