import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';
import { pushState } from '$app/navigation';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import type { FramedData } from '$lib/types/xl';

export function getCiteLink(url: URL, value: string) {
	const newSearchParams = new SvelteURLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.set('cite', value);
	return `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
}

export function handleClickCite(
	event: MouseEvent & { currentTarget: HTMLAnchorElement },
	state: object,
	id: string
) {
	event.preventDefault();
	pushState(event.currentTarget.href, { ...state, cite: id });
}

interface CSLName {
	family?: string;
	given?: string;
	literal?: string;
}

interface CSLDate {
	'date-parts'?: Array<number | string>[];
	raw?: string;
}

interface CslJSON {
	id: string | number;
	type: string; // e.g book or article'
	title?: string;
	author?: CSLName[];
	ISBN?: string;
	issued?: CSLDate;
	publisher?: string;
	'publisher-place'?: string;
}

// TODO lang
// TODO add many
export function mapCiteFrom(instance: FramedData) {
	const csl: CslJSON = {
		id: instance['@id'] as string,
		type: 'book', // TODO type mapping
		title: instance.hasTitle[0].computedLabel,
		author: instance.instanceOf?.contribution?.map((c) => {
			return {
				family: c?.agent?.familyName,
				given: c?.agent?.givenName
			};
		}),
		ISBN: instance?.identifiedBy
			.map((i) => {
				if (i['@type'] === 'ISBN') {
					return i.value;
				}
			})
			.join(', '),
		issued: { 'date-parts': [[instance?.publication?.[0].year]] },
		publisher: instance?.publication?.[0].agent?.computedLabel,
		'publisher-place': instance?.publication?.[0].place?.[0].computedLabel
	};

	return new Cite(csl);
}

// export function formatCsl(
// 		csl: CslJSON,
// 		style?: 'csl' | 'bibtex' | 'ris' | 'citation-*' = 'csl',
// 		type?: 'json' | 'html' | 'string' = 'json',
// 		format?: 'real' | 'string' = 'real'
// 	) {
// }

// CSL-JSON
// cite.get({format: 'real', type: 'json', style: 'csl'})

// cite.get({
//   type: 'html',
//   style: 'citation-apa',
//   prepend ({id}) {
//     return `[${id}]: `
//   },
//   append: ` [Retreived on ${date}]`
// })

// let templateName = 'custom'
// let template = '<?xml version="1.0" encoding="utf-8"?><style ...>...</style>' // The actual XML file

// let config = Cite.plugins.config.get('csl')
// config.templates.add(templateName, template)

// let example = new Cite(...)
// example.format('bibliography', {
//   format: 'html',
//   template: templateName,
//   lang: 'en-US'
// })

// CSL Locale Plugins
// Replace templateName with the template name you want to use.

// Different CSL Locales can be registered like this:

// let language = 'en-GB'
// let locale = '<?xml version="1.0" encoding="utf-8"?><locale ...>...</locale>' // The actual XML file

// let config = Cite.plugins.config.get('csl')
// config.locales.add(language, locale)

// let example = new Cite(...)
// example.format('bibliography', {
//   format: 'html',
//   template: 'apa',
//   lang: language
// })
