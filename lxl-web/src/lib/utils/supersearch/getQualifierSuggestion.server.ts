import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import type { FramedData } from '../xl';
import { env } from '$env/dynamic/private';
import { JsonLd } from '$lib/utils/xl';
import QUALIFIER_TYPES_BY_BASE_CLASS from '$lib/assets/json/qualifierTypeByBaseClass.json';
import addWrappingSpaces from './addWrappingSpaces';

export type QualifierSuggestion =
	| {
			label: string;
			changes: {
				full: {
					from: number;
					to?: number;
					insert: string;
				};
				type: {
					from: number;
					to?: number;
					insert: string;
				};
			};
	  }
	| undefined;

function getQualifierSuggestion({
	query,
	item,
	itemBaseClasses, // it's a little unfortunate that we have to pass along itemBaseClasses but we currently cannot access vocabUtils without access to locals (is locals really needed? We should be able to export a server only class without locals...)
	editedRange
}: {
	query: string;
	item: FramedData;
	itemBaseClasses: string[];
	editedRange: { from: number; to: number };
}): QualifierSuggestion {
	const qualifierType = Object.entries(QUALIFIER_TYPES_BY_BASE_CLASS).find(([qualifiedBaseClass]) =>
		itemBaseClasses.includes(qualifiedBaseClass)
	)?.[1];

	const qualifierValue = getQualifierValue(item);

	if (!qualifierType || !qualifierValue) {
		return undefined;
	}

	return {
		label: qualifierType,
		changes: {
			full: {
				...editedRange,
				insert: addWrappingSpaces({
					insert: `${qualifierType}:${qualifierValue}`,
					query,
					editedRange
				})
			},
			type: {
				from: editedRange.to, // append when only adding type
				insert: addWrappingSpaces({ insert: `${qualifierType}:`, query, editedRange })
			}
		}
	};
}

function getPrefix(id: string) {
	if (id.includes(env.API_URL)) {
		return 'libris:';
	}
	return Object.entries(PREFIXES_BY_NAMESPACE).find(([ns]) => id.includes(ns))?.[1];
}

function getQualifierValue(item: FramedData) {
	const prefix = getPrefix(item?.[JsonLd.ID] as string);
	const id = (item?.['@id'] as string).split('/').pop();

	if (prefix && id) {
		return '"' + prefix + encodeURIComponent(id) + '"';
	}
}

export default getQualifierSuggestion;
