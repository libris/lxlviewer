import { JsonLd } from '$lib/utils/xl';

export type AutocompleteItem = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	label: string;
	description?: string;
	typeLabel: string;
	totalReverseLinks: number;
	editedRange: { from: number; to: number };
	qualifierType?: string;
	qualifierValue?: string;
	resourceLink?: string;
	qualifierLink?: string;
	qualifierTypeLink?: string;
};

export type AutocompleteResponse = {
	items: AutocompleteItem[];
	totalItems: number;
	itemOffset: number;
	itemsPerPage: number;
};
