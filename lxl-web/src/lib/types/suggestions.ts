export type PropertySuggestion = {
	'@id': string;
	'@type': string;
	key: string;
	labelByLang: { [key: string]: string };
};

export type PartSuggestion = {
	'@id': string;
	'@type': string;
	labelByLang: { [key: string]: string };
	descriptionByLang: { [key: string]: string };
} & ({ keyByLang: { key: string } } | { [key: string]: string });
