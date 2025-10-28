import { Cite, plugins } from '@citation-js/core';
import { goto, preloadData, pushState } from '$app/navigation';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import type { CSLJSON, AvailableCitationFormat } from '$lib/types/citation';
import type { LocaleCode } from '$lib/i18n/locales';

export const availableFormats = {
	chicago: {
		name: 'Chicago',
		fullName: 'Chicago (17th edition author-date)'
	},
	mla: {
		name: 'MLA',
		fullName: 'MLA (Modern Language Association 9th edition)'
	},
	apa: {
		name: 'APA', // built-in
		fullName: 'APA (American Psychological Association 7th edition)'
	},
	ris: {
		name: 'RIS',
		fileFormat: 'ris'
	},
	bibtex: {
		name: 'BibTeX',
		fileFormat: 'bib'
	},
	csl: {
		name: 'CSL',
		fullName: 'CSL-JSON',
		fileFormat: 'json'
	}
};

let loaded = false;

// Create a more managable wrapper around citation.js + get some typestafety
export async function initCite(locale: LocaleCode) {
	if (!loaded) {
		await loadCiteResources();
	}

	const lang = citationLangFromLocaleCode(locale);
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
				return cite.format('bibliography', { template: 'chicago', format: 'html', lang });
			case 'apa':
				return cite.format('bibliography', { template: 'apa', format: 'html', lang });
			case 'mla':
				return cite.format('bibliography', { template: 'mla', format: 'html', lang });
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

	const externalStyleTemplates: Partial<Record<AvailableCitationFormat, string>> = {
		// https://editor.citationstyles.org/styleInfo/?styleId=http%3A%2F%2Fwww.zotero.org%2Fstyles%2Fchicago-author-date
		chicago: (await import('$lib/assets/csl/chicago-author-date.csl?raw')).default,
		// https://editor.citationstyles.org/styleInfo/?styleId=http%3A%2F%2Fwww.zotero.org%2Fstyles%2Fmodern-language-association
		mla: (await import('$lib/assets/csl/modern-language-association.csl?raw')).default
	};

	// https://github.com/citation-js/citation-js/tree/main/packages/plugin-csl
	const config = plugins.config.get('@csl');

	const sv = (await import('$lib/assets/csl/locales-sv-SE.xml?raw')).default;
	config.locales.add('sv-SE', sv);

	const formatKeys = Object.keys(availableFormats) as (keyof typeof availableFormats)[];
	formatKeys.forEach((key) => {
		if (key in externalStyleTemplates) {
			config.templates.add(key, externalStyleTemplates[key]);
		}
	});

	loaded = true;
}

export function getAvailableFormats() {
	return Object.entries(availableFormats).map(([key, value]) => {
		return {
			key: key as AvailableCitationFormat,
			name: value.name,
			...('fullName' in value && { fullName: value.fullName }),
			...('fileFormat' in value && { fileFormat: value.fileFormat })
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
	state: object,
	id: string
) {
	// https://svelte.dev/docs/kit/shallow-routing#Loading-data-for-a-route
	event.preventDefault();
	const { href } = event.currentTarget;
	const result = await preloadData(href);

	if (result.type === 'loaded' && result.status === 200) {
		pushState(href, { ...state, citations: await result.data.citations, citationId: id });
	} else {
		goto(href);
	}
}

function citationLangFromLocaleCode(locale: LocaleCode) {
	switch (locale) {
		case 'sv':
			return 'sv-SE';
		case 'en':
			return 'en-US';
		default:
			return 'sv-SE';
	}
}
