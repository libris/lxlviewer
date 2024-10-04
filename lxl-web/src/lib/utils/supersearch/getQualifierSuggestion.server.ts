import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import type { FramedData } from '../xl';
import { env } from '$env/dynamic/private';
import { JsonLd } from '$lib/utils/xl';
import QUALIFIER_TYPES_BY_BASE_CLASS from '$lib/assets/json/qualifierTypeByBaseClass.json';
import {
	globalVocabUtil as vocabUtil,
	globalDisplayUtil as displayUtil
} from '../../../hooks.server';
import { toString } from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';

export type QualifierSuggestion =
	| {
			label: string;
			changes: {
				from: number;
				to?: number;
				insert: string;
			};
	  }
	| undefined;

function getQualifierSuggestion({
	query,
	item,
	editedRange,
	lang
}: {
	query: string;
	item: FramedData;
	editedRange: { from: number; to: number };
	lang: string;
}): QualifierSuggestion {
	const qualifierMatch = Object.entries(QUALIFIER_TYPES_BY_BASE_CLASS).find(
		([qualifiedBaseClass]) =>
			vocabUtil.getBaseClasses(item?.['@type'] as string).includes(qualifiedBaseClass)
	);

	if (!qualifierMatch) {
		return undefined;
	}

	const [baseClass, type] = qualifierMatch;
	const value = getQualifierValue(item);

	return {
		label: toString(
			displayUtil.lensAndFormat(vocabUtil.getDefinition(type), LxlLens.CardHeading, lang) ||
				displayUtil.lensAndFormat(vocabUtil.getDefinition(baseClass), LxlLens.CardHeading, lang)
		),
		changes: {
			...editedRange,
			insert:
				(!/^[\s]/.test(query.slice(0, editedRange.from)) && editedRange.from !== 0 ? ' ' : '') + // add whitespace before if content before insert doesn't start with a whitespace or is first index
				`${type}:${value}` +
				(!/^[\s]/.test(query.slice(editedRange.to)) ? ' ' : '') // add whitespace after if content after insert doesn't start with a whitespace
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
		return '"' + prefix + id + '"';
	}
}

export default getQualifierSuggestion;
