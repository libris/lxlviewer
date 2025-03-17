export type UserSettings = SettingsObj | undefined;

interface SettingsObj {
	facetSort: {
		[dimension: string]: string;
	};
	myLibraries: {
		[id: string]: string;
	};
	debug: DebugFlags[];
}

export enum DebugFlags {
	ES_SCORE = 'esScore'
}
