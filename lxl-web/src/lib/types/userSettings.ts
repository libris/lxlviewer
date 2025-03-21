import { JsonLd } from "./xl";

export interface LibraryItem {
	[JsonLd.ID]: string;
	label: string;
	sigel: string;
}

export interface UserSettingsType {
	facetSort: {
		[dimension: string]: string;
	};
	debug: DebugFlags[];
	myLibraries?: LibraryItem[]
}

export enum DebugFlags {
	ES_SCORE = 'esScore'
}
