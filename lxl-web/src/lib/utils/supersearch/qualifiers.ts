import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import type { FramedData } from '../xl';
import { env } from '$env/dynamic/private';
import { JsonLd, toString } from '$lib/utils/xl';
import QUALIFIER_TYPES_BY_BASE_CLASS from '$lib/assets/json/qualifierTypeByBaseClass.json';
import { LxlLens } from '$lib/utils/display.types';
import {
	globalVocabUtil as vocabUtil,
	globalDisplayUtil as displayUtil
} from '../../../hooks.server';

export type Qualifier = {
	type: string;
	typeLabel: string;
	value?: string;
	valueLabel?: string;
	query: string;
};

export type QualifierChanges =
	| {
			from: number;
			to?: number;
			insert: string;
	  }
	| undefined;

export function getQualifier({
	item,
	lang
}: {
	item: FramedData;
	lang: string;
}): Qualifier | undefined {
	const qualifierMatch = Object.entries(QUALIFIER_TYPES_BY_BASE_CLASS).find(
		([qualifiedBaseClass]) =>
			vocabUtil.getBaseClasses(item?.['@type'] as string).includes(qualifiedBaseClass)
	);

	if (!qualifierMatch) {
		return undefined;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [baseClass, type] = qualifierMatch;
	const value = getQualifierValue(item);

	return {
		type,
		typeLabel: toString(
			displayUtil.lensAndFormat(vocabUtil.getDefinition(type), LxlLens.CardHeading, lang)
		),
		value,
		valueLabel: value
			? toString(displayUtil.lensAndFormat(item, LxlLens.PageHeading, lang))
			: undefined,
		query: `${type}:${value || ''}`
	};
}

export function getQualifierChanges({
	query,
	qualifier,
	editedRange
}: {
	query: string;
	qualifier: Qualifier;
	editedRange: { from: number; to: number };
}): QualifierChanges {
	return {
		...editedRange,
		insert:
			(!/^[\s]/.test(query.slice(0, editedRange.from)) && editedRange.from !== 0 ? ' ' : '') + // add whitespace before if content before insert doesn't start with a whitespace or is first index
			`${qualifier.type}:${qualifier.value}` +
			(!/^[\s]/.test(query.slice(editedRange.to)) ? ' ' : '') // add whitespace after if content after insert doesn't start with a whitespace
	};
}

export function getPrefix(id: string) {
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
