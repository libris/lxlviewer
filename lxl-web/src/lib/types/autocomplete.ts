import { JsonLd } from '$lib/utils/xl';

export type AutocompleteItem = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	label: string;
	description?: string;
	typeLabel: string;
	totalReverseLinks: number;
};