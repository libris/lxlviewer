import { type PartSuggestion } from '$lib/types/suggestions';

function getSuggestionTypeLabel(suggestion: PartSuggestion, lang: string) {
	const typeLabelsByLang: { [key: string]: { [key: string]: string } } = {
		Property: {
			en: 'Egenskap',
			sv: 'Egenskap'
		},
		DatatypeProperty: {
			en: 'Data type property',
			sv: 'Egenskap'
		},
		ObjectProperty: {
			en: 'Object property',
			sv: 'Relation'
		},
		boolean: {
			en: 'Boolean keyword',
			sv: 'Boolesk sökterm'
		}
	};

	return typeLabelsByLang[suggestion['@type']]?.[lang] || suggestion['@type'];
}

export default getSuggestionTypeLabel;
