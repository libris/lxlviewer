import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-ris';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';

import { goto, preloadData, pushState } from '$app/navigation';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import type { FramedData } from '$lib/types/xl';
import { centerOnWork } from './centerOnWork';
import type { CSLJSON } from '$lib/types/citation';

// https://editor.citationstyles.org/styleInfo/?styleId=http%3A%2F%2Fwww.zotero.org%2Fstyles%2Fchicago-author-date
import chicago from '$lib/assets/csl/chicago-author-date.csl?raw';

// https://github.com/citation-js/citation-js/tree/main/packages/plugin-csl
const templateName = 'chicago';
const template = chicago;

const config = plugins.config.get('@csl');
config.templates.add(templateName, template);

// console.log(config)

export function getCiteLink(url: URL, value: string) {
	const newSearchParams = new SvelteURLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.set('cite', value);
	return `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
}

export async function handleClickCite(
	event: MouseEvent & { currentTarget: HTMLAnchorElement },
	state: object
) {
	// https://svelte.dev/docs/kit/shallow-routing#Loading-data-for-a-route
	event.preventDefault();
	const { href } = event.currentTarget;
	const result = await preloadData(href);

	if (result.type === 'loaded' && result.status === 200) {
		pushState(href, { ...state, citations: await result.data.citations });
	} else {
		goto(href);
	}
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
