import type { addQualifier } from '$lib/types/search';
import { JsonLd, type FramedData } from '$lib/types/xl';
import { VocabUtil } from '$lib/utils/xl';
import { BASE_CLASS_FROM_QUALIFIER_KEY } from './getEditedPartEntries';
import { env } from '$env/dynamic/private';
import type { EditedRanges } from './getEditedRanges';
import type { LocaleCode } from '$lib/i18n/locales';

const PREFIXES_BY_NAMESPACE = {
	'https://id.kb.se/vocab/': 'kbv:',
	'http://id.loc.gov/ontologies/bibframe/': 'bf:',
	'http://purl.org/dc/terms/': 'dc:',
	'http://schema.org/': 'sdo:',
	'https://id.kb.se/term/sao/': 'sao:',
	'https://id.kb.se/marc/': 'marc:',
	'https://id.kb.se/term/saogf/': 'saogf:',
	'https://id.kb.se/term/barn/': 'barn:',
	'https://id.kb.se/term/barngf/': 'barngf:',
	'https://libris.kb.se/library/': 'sigel:',
	'https://id.kb.se/language/': 'lang:'
};

export function itemAsQualifiers(
	item: FramedData,
	editedRanges: EditedRanges,
	_q: string,
	locale: LocaleCode,
	vocabUtil: VocabUtil
): addQualifier[] {
	const itemType = item[JsonLd.TYPE] as string | string[];
	const itemTypeBaseClasses = vocabUtil.getBaseClasses(itemType);
	const qualifierBaseClasses = Object.keys(BASE_CLASS_FROM_QUALIFIER_KEY);
	const itemBaseClass = itemTypeBaseClasses
		.filter((c) => qualifierBaseClasses.includes(c))
		.join() as keyof typeof BASE_CLASS_FROM_QUALIFIER_KEY;

	const predicates = BASE_CLASS_FROM_QUALIFIER_KEY?.[itemBaseClass];
	const qualifierValue = getQualifierValue(item[JsonLd.ID] as string);

	if (predicates && Array.isArray(predicates)) {
		return predicates.map((p) => {
			const qualifier = `${p}:${qualifierValue}`;
			const qWithQualifier = _q.slice(0, editedRanges.from) + qualifier + _q.slice(editedRanges.to);
			const label: string = vocabUtil.getLabelByLang(p, locale);
			return {
				label: label || p,
				_q: qWithQualifier,
				from: editedRanges.from,
				to: editedRanges.to
			};
		});
	} else return [];
}

function getQualifierValue(id: string) {
	const prefix = getPrefix(id);
	const qId = id.split('/').pop();

	if (prefix && qId) {
		return '"' + prefix + qId + '"';
	}
	return id;
}

function getPrefix(id: string) {
	const prefixFromNamespace = Object.entries(PREFIXES_BY_NAMESPACE).find(([ns]) =>
		id.includes(ns)
	)?.[1];

	if (prefixFromNamespace) {
		return prefixFromNamespace;
	}
	if (id.includes(env.API_URL)) {
		return 'libris:';
	}
	return '';
}
