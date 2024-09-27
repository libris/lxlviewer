import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import type { FramedData } from '../xl';
import { env } from '$env/dynamic/private';
import { JsonLd } from '$lib/utils/xl';
import QUALIFIER_TYPES_BY_BASE_CLASS from '$lib/assets/json/qualifierTypeByBaseClass.json';

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
				insert:
					(!/^[\s]/.test(query.slice(0, editedRange.from)) && editedRange.from !== 0 ? ' ' : '') + // add whitespace before if content before insert doesn't start with a whitespace or is first index
					`${qualifierType}:${qualifierValue}` +
					(!/^[\s]/.test(query.slice(editedRange.to)) ? ' ' : '') // add whitespace after if content after insert doesn't start with a whitespace
			},
			type: {
				from: editedRange.to,
				to: editedRange.to,
				insert: ` ${qualifierType}:`
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
