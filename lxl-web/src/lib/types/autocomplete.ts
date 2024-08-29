export type AutocompleteSuggestion = {
	'@id': string;
	'@type': string;
	label: string;
	description?: string;
	replacement: string;
};

export type QualifiersResponse = {
	name: string;
	'@type': string;
	item?: unknown;
	lang?: string;
}[];

type ValidateQualifierItem = {
	match: string;
	name: string;
	value: string | null;
	range: {
		from: number;
		to: number;
	};
};

export type ValidateQualifiersResponse = {
	valid: ValidateQualifierItem[] | null;
	invalid: ValidateQualifierItem[] | null;
};
