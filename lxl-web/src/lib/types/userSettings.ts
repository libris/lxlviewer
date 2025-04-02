import { JsonLd } from './xl';

export interface LibraryItem {
	[JsonLd.ID]: string;
	label: string;
	sigel: string;
}

export type UserSettings = {
	facetSort?: {
		[dimension: string]: string;
	};
	myLibraries?: {
		[id: string]: LibraryItem;
	};
	debug?: DebugFlags[];
};

export enum DebugFlags {
	ES_SCORE = 'esScore'
}
