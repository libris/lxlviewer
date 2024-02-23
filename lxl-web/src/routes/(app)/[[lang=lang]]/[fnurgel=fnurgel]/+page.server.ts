import { env } from '$env/dynamic/private';
import { type DisplayDecorated, DisplayUtil, type FramedData, pickProperty } from '$lib/utils/xl';
import { getSupportedLocale } from '$lib/i18n/locales';
import { LxlLens } from '$lib/utils/display.types';

export interface ResourcePage {
	header: DisplayDecorated;
	overview: DisplayDecorated;
	details: DisplayDecorated;
}

export const load = async ({ params, locals, fetch }) => {
	const doc = await loadDoc(fetch, params.fnurgel);

	const displayUtil: DisplayUtil = locals.display;
	//const vocabUtil: VocabUtil = locals.vocab;

	const data = doc;

	const locale = getSupportedLocale(params?.lang);

	// TODO this doesn't really play well with alternativeProperties...?
	// say we want to use alternativeProperties for hasTitle in the heading
	// "alternateProperties": [
	//	 {"subPropertyOf": "hasTitle", "range": "KeyTitle"},
	//	 {"subPropertyOf": "hasTitle", "range": "Title"},
	// 	 "hasTitle"
	// ]
	// we then probably want all titles in the overview
	// but we don't want them there when there is only one title?
	// or just place "hasTitle" (without alternateProperties) in details?

	const overview = displayUtil.lensAndFormat(data, LxlLens.PageOverView, locale);
	const [overviewNoInstances, hasInstances] = pickProperty(overview, ['hasInstance']);

	return {
		heading: displayUtil.lensAndFormat(data, LxlLens.PageHeading, locale),
		overview: overviewNoInstances,
		details: displayUtil.lensAndFormat(data, LxlLens.PageDetails, locale),
		instances: hasInstances
	};
};

async function loadDoc(fetch, fnurgel: string) {
	const iri = `${env.API_URL}/${fnurgel}?framed=true`;
	const response = await fetch(iri, { headers: { Accept: 'application/ld+json' } });
	const doc = await response.json();
	return doc['mainEntity'] as FramedData;
}
