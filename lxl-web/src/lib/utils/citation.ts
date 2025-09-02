import { Cite, plugins } from '@citation-js/core';
import { goto, preloadData, pushState } from '$app/navigation';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import type { FramedData } from '$lib/types/xl';
import { centerOnWork } from './centerOnWork';
import type { AvailableCitationFormat, CSLJSON } from '$lib/types/citation';

export const availableFormats = {
	chicago: {
		name: 'Chicago',
		fullName: 'Chicago 17th edition (author-date)',
		// https://editor.citationstyles.org/styleInfo/?styleId=http%3A%2F%2Fwww.zotero.org%2Fstyles%2Fchicago-author-date
		source: (await import('$lib/assets/csl/chicago-author-date.csl?raw')).default
	},
	mla: {
		name: 'MLA',
		fullName: 'MLA (Modern Language Association 9th edition)',
		// https://editor.citationstyles.org/styleInfo/?styleId=http%3A%2F%2Fwww.zotero.org%2Fstyles%2Fmodern-language-association
		source: (await import('$lib/assets/csl/modern-language-association.csl?raw')).default
	},
	apa: {
		name: 'APA', // built-in
		fullName: 'APA (American Psychological Association 7th edition)'
	},
	ris: {
		name: 'RIS' // imported via plugin
	},
	bibtex: {
		name: 'Bibtex' // imported via plugin
	},
	csl: {
		name: 'CSL' // imported via plugin
	}
	// TODO add more templates
};

let loaded = false;

// TODO more accurate mapping
export function cslFromMainEntity(data: FramedData): CSLJSON[] {
	const mainEntity = centerOnWork(data);

	if (mainEntity?.['@reverse']?.instanceOf) {
		// map one of many
		return mainEntity?.['@reverse']?.instanceOf.map((i) => mapCsl(i, mainEntity));
	} else {
		// map work + instance
		return [mapCsl(mainEntity, mainEntity)];
	}

	function mapCsl(instance: FramedData, mainEntity: FramedData): CSLJSON {
		return {
			id: instance['@id'] as string,
			type: 'book', // TODO type mapping
			title: instance?.hasTitle?.map((t) => t?.computedLabel).join('; '),
			author: [
				{
					family: mainEntity.contribution?.[0]?.agent?.familyName,
					given: mainEntity.contribution?.[0]?.agent?.givenName
				}
			],
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
}

// Create a more managable wrapper around citation.js + get some typestafety
export async function initCite() {
	if (!loaded) {
		await loadCiteResources();
	}

	const cite = new Cite();

	function add(data: CSLJSON[]) {
		cite.add(data);
	}

	function formatAs(name: AvailableCitationFormat) {
		switch (name) {
			case 'csl':
				return cite.format('data');
			case 'ris':
				return cite.format('ris');
			case 'bibtex':
				return cite.format('bibtex');
			case 'chicago':
				return cite.format('bibliography', { template: 'chicago', format: 'html' });
			case 'apa':
				return cite.format('bibliography', { template: 'apa', format: 'html' });
			case 'mla':
				return cite.format('bibliography', { template: 'mla', format: 'html' });
			default:
				console.warn('asked for unavailable format', name);
				return '-';
		}
	}

	return { add, formatAs };
}

// load these resources only if user uses cite functionality
// + enforce code splitting...
async function loadCiteResources() {
	await import('@citation-js/plugin-ris');
	await import('@citation-js/plugin-bibtex');
	await import('@citation-js/plugin-csl');

	// https://github.com/citation-js/citation-js/tree/main/packages/plugin-csl
	const config = plugins.config.get('@csl');

	Object.entries(availableFormats).forEach(async ([key, value]) => {
		if ('source' in value) {
			config.templates.add(key, value.source);
		}
	});

	loaded = true;
}

export function getAvailableFormats() {
	return Object.entries(availableFormats).map(([key, value]) => {
		return {
			key: key as AvailableCitationFormat,
			name: value.name,
			fullName: value?.fullName || ''
		};
	});
}

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
