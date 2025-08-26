import { Cite, type CSLJSON } from '@citation-js/core';
import '@citation-js/plugin-ris';
import '@citation-js/plugin-bibtex';
import { pushState } from '$app/navigation';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import type { FramedData } from '$lib/types/xl';
import { centerOnWork } from './centerOnWork';

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

/**
 * @param mainEntity
 * Maps mainEntity into CSLJSON and returns a citation.js Cite instance
 * works containing multiple instances will get one cite for each
 * TODO: add lang
 */
export function citeFromMainEntity(data: FramedData) {
	let result: CSLJSON[] = [];

	const mainEntity = centerOnWork(data);
	if (mainEntity?.['@reverse']?.instanceOf) {
		// map work with instances
		result = mainEntity?.['@reverse']?.instanceOf.map((instance) => mapCsl(instance, mainEntity));
	} else {
		// map instance
		result = [mapCsl(mainEntity, mainEntity)];
	}

	function mapCsl(instance, mainEntity): CSLJSON {
		return {
			id: instance['@id'] as string,
			type: 'book', // TODO type mapping
			title: instance?.hasTitle?.map((t) => t?.computedLabel).join('; '),
			author: mainEntity?.contribution?.map((c) => {
				return {
					family: c?.agent?.familyName,
					given: c?.agent?.givenName
				};
			}),
			ISBN: instance?.identifiedBy
				?.map((i) => {
					if (i?.['@type'] === 'ISBN') {
						return i?.value;
					}
				})
				.join('; '),
			issued: { 'date-parts': [instance?.publication?.[0]?.year] },
			publisher: instance?.publication?.[0]?.agent?.computedLabel,
			'publisher-place': instance?.publication?.[0]?.place?.[0]?.computedLabel
		};
	}

	return new Cite(result);
}

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
