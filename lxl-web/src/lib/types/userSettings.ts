export type UserSettings = SettingsObj | undefined;

interface SettingsObj {
	facetSort: {
		[dimension: string]: string;
	};
}
