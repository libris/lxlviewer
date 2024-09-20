import { JsonLd } from '$lib/utils/xl';

export type AutocompleteItem = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	label: string;
	description?: string;
	typeLabel: string;
	totalReverseLinks: number;
};

export type AutocompleteResponse = {
	items: AutocompleteItem[];
	totalItems: number;
	itemOffset: number;
	itemsPerPage: number;
};
