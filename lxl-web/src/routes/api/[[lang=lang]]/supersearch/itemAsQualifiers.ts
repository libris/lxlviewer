import type { QualifierSuggestion } from '$lib/types/search';
import { type FramedData } from '$lib/types/xl';
// import { VocabUtil } from '$lib/utils/xl';
// import {
// 	BASE_CLASS_FROM_QUALIFIER_KEY,
// 	QUALIFIER_KEY_FROM_ALIAS,
// 	findInMap
// } from './qualifierMappings';
// import { env } from '$env/dynamic/private';
// import type { EditedRanges } from './getEditedRanges';
import type { LocaleCode } from '$lib/i18n/locales';
// import * as lxljs from "lxljs";

// const PREFIXES_BY_NAMESPACE = {
// 	'https://id.kb.se/vocab/': 'kbv:',
// 	'http://id.loc.gov/ontologies/bibframe/': 'bf:',
// 	'http://purl.org/dc/terms/': 'dc:',
// 	'http://schema.org/': 'sdo:',
// 	'https://id.kb.se/term/sao/': 'sao:',
// 	'https://id.kb.se/marc/': 'marc:',
// 	'https://id.kb.se/term/saogf/': 'saogf:',
// 	'https://id.kb.se/term/barn/': 'barn:',
// 	'https://id.kb.se/term/barngf/': 'barngf:',
// 	'https://libris.kb.se/library/': 'sigel:',
// 	'https://id.kb.se/language/': 'lang:'
// };

function itemAsQualifiers(item: FramedData, locale: LocaleCode): QualifierSuggestion[] {
	const qualifiers = item['_qualifiers'];
	return qualifiers.map((qualifier) => {
		const predicate = qualifier['_predicate'];
		const label = predicate.labelByLang?.[locale] || predicate.label;
		return {
			label: label,
			_q: qualifier['_q'],
			cursor: qualifier['_cursor']
		};
	});
	//
	// const itemType = item[JsonLd.TYPE] as string | string[];
	// const itemTypeBaseClasses = vocabUtil.getBaseClasses(itemType);
	// const qualifierBaseClasses = Object.keys(BASE_CLASS_FROM_QUALIFIER_KEY);
	// const sharedBaseClasses = itemTypeBaseClasses.filter((c) =>
	// 	qualifierBaseClasses.includes(c)
	// ) as (keyof typeof BASE_CLASS_FROM_QUALIFIER_KEY)[];
	// let predicates: string[] = [];
	//
	// sharedBaseClasses.forEach((cl) => {
	// 	const p = BASE_CLASS_FROM_QUALIFIER_KEY[cl];
	// 	if (p) {
	// 		predicates = [...predicates, ...p];
	// 	}
	// });
	//
	// // if user explicitly requested a relation ('contributor:'), only show that one
	// if (editedRanges.qualifierKey) {
	// 	const qualifierKey = _q.substring(editedRanges.qualifierKey.from, editedRanges.qualifierKey.to);
	// 	const keyFromAlias = findInMap(QUALIFIER_KEY_FROM_ALIAS, qualifierKey).join();
	// 	predicates = predicates?.filter(
	// 		(p: string) => p.toLowerCase() === (keyFromAlias.toLowerCase() || qualifierKey.toLowerCase())
	// 	);
	// }
	//
	// const qualifierValue = getQualifierValue(item[JsonLd.ID] as string);
	//
	// return predicates.map((p) => {
	// 	const qualifier = `${p}:${qualifierValue}`;
	// 	const qWithQualifier = (
	// 		_q.slice(0, editedRanges.from).trim() +
	// 		' ' +
	// 		qualifier +
	// 		' ' +
	// 		_q.slice(editedRanges.to).trim()
	// 	).trim();
	// 	const label: string = vocabUtil.getLabelByLang(p, locale);
	// 	return {
	// 		label: label || p,
	// 		_q: qWithQualifier,
	// 		cursor: qWithQualifier.lastIndexOf(qualifier) + qualifier.length
	// 	};
	// });
}
//
// function getQualifierValue(id: string) {
// 	const prefix = getPrefix(id);
// 	const qId = id.split('/').pop();
//
// 	if (prefix && qId) {
// 		return '"' + prefix + qId + '"';
// 	}
// 	return id;
// }
//
// function getPrefix(id: string) {
// 	const prefixFromNamespace = Object.entries(PREFIXES_BY_NAMESPACE).find(([ns]) =>
// 		id.includes(ns)
// 	)?.[1];
//
// 	if (prefixFromNamespace) {
// 		return prefixFromNamespace;
// 	}
// 	if (id.includes(env.API_URL)) {
// 		return 'libris:';
// 	}
// 	return '';
// }

export default itemAsQualifiers;
