import { env } from '$env/dynamic/private';
import { DisplayUtil, type FramedData, LensType, VocabUtil } from '$lib/utils/xl';
import { getSupportedLocale } from "$lib/i18n/locales";

export const load = async ({ params, locals, fetch }) => {
	const doc = await loadDoc(fetch, params.fnurgel);

	const displayUtil: DisplayUtil = locals.display;
	const vocabUtil: VocabUtil = locals.vocab;

	const foo = {
		card_decorated: displayUtil.format(displayUtil.applyLensOrdered(doc, LensType.Card), getSupportedLocale(params?.lang)),
		format_index: displayUtil._getFormatIndex()
		//card: displayUtil.applyLens(doc, LensType.Chip),
		//card_ordered: displayUtil.applyLensOrdered(doc, LensType.Card),
	};

	return { fnurgel: params.fnurgel, doc, foo };
};

async function loadDoc(fetch, fnurgel: string) {
	const iri = `${env.API_URL}/${params.fnurgel}?framed=true`;
	const response = await fetch(iri, { headers: { Accept: 'application/ld+json' } });
	const doc = await response.json();
	return doc['mainEntity'] as FramedData;
}
