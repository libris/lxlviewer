import type { LibraryItem } from '$lib/types/search';

export type UserSettings = SettingsObj | undefined;

interface SettingsObj {
	facetSort: {
		[dimension: string]: string;
	};
	myLibraries: {
		[id: string]: LibraryItem;
	};
	debug: DebugFlags[];
}

export enum DebugFlags {
	ES_SCORE = 'esScore'
}
