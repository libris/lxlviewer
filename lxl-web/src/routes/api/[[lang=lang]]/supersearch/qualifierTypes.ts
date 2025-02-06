export const DEFAULT_SUPERSEARCH_TYPES = ['Agent', 'Concept', 'Language', 'Work'];

const QUALIFIER_KEY_FROM_ALIAS = {
	Contributor: ['medverkande'],
	Language: ['språk'],
	Subject: ['ämne'],
	Bibliography: ['bibliografi']
};

const QUALIFIER_SEARCH_TYPE_FROM_KEY = {
	Agent: ['contributor'], // + subject? I.e should we also search for agents when typing 'subject:'?
	Subject: ['subject'],
	GenreForm: ['genreForm'],
	Language: ['language', 'translationOf.language'],
	Library: ['itemHeldBy'], // library??
	Bibliography: ['bibliography']
};

/**
 * Get the 'base' qualifier key from a translated key/alternartive query code
 */
export function qualifierKeyFromAlias(alias: string) {
	return iterateMapping(QUALIFIER_KEY_FROM_ALIAS, alias);
}

/**
 * Get the type we want to search for from a qualifier key
 */
export function qualifierSearchTypeFromKey(k: string) {
	return iterateMapping(QUALIFIER_SEARCH_TYPE_FROM_KEY, k);
}

/**
 * Get a _q-formatted string for "rdf:type" from one or many types
 */
export function getTypeQualifier(types: string | string[]) {
	if (types) {
		if (Array.isArray(types)) return `"rdf:type":(${types.join(' OR ')})`;
		if (typeof types === 'string') return `"rdf:type":${types}`;
		return '';
	}
	return '';
}

/**
 * Check whether a _q-string specifies a type
 */
export function queryIncludesType(q: string | undefined) {
	if (q && typeof q === 'string') {
		return !!q.match(/"rdf:type"[:=]/g);
	}
	return false;
}

function iterateMapping(map: Record<string, string[]>, k: string) {
	if (k && typeof k === 'string') {
		for (const [key, value] of Object.entries(map)) {
			if (Array.isArray(value) && value.some((el) => el.toLowerCase() === k.toLowerCase())) {
				return key;
			}
		}
	}
}
