export type AutocompleteResponse = {
	items: unknown;
	qualifiers: ValidateQualifiersResponse;
};

export type QualifiersResponse = {
	name: string;
	'@type': string;
	item?: unknown;
	lang?: string;
}[];

export type ValidateQualifiersResponse = ValidateQualifierItem[] | null;

export type ValidateQualifierItem = {
	match: string;
	name: string;
	value: string | null;
	range: {
		from: number;
		to: number;
	};
	valid: boolean;
};
