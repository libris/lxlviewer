import { env } from '$env/dynamic/private';
import { type DisplayDecorated, DisplayUtil, type FramedData, LensType } from '$lib/utils/xl';
import { getSupportedLocale } from '$lib/i18n/locales';

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

	const foo = {
		card_decorated: displayUtil.format(
			displayUtil.applyLensOrdered(data, LensType.Card),
			getSupportedLocale(params?.lang)
		),
		card_ordered: displayUtil.applyLensOrdered(data, LensType.Card),
		format_index: displayUtil._getFormatIndex()
		//card: displayUtil.applyLens(doc, LensType.Chip),
	};

	return { fnurgel: params.fnurgel, doc, foo };
};

async function loadDoc(fetch, fnurgel: string) {
	const iri = `${env.API_URL}/${fnurgel}?framed=true`;
	const response = await fetch(iri, { headers: { Accept: 'application/ld+json' } });
	const doc = await response.json();
	return doc['mainEntity'] as FramedData;
}
