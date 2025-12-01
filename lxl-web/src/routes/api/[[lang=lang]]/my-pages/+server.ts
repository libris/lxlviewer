import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { getSupportedLocale, type LocaleCode as LangCode } from '$lib/i18n/locales.js';
import type { LibraryResult, PartialCollectionView } from '$lib/types/search';
import { JsonLd, LensType } from '$lib/types/xl.js';
import { DisplayUtil, toString, VocabUtil } from '$lib/utils/xl';
import { asSearchResultItem } from '$lib/utils/search.js';

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);

	const _q = url.searchParams.get('_q') || '';

	if (_q.length !== 0) {
		const queryWithWildCard = _q + (_q.match(/[^*]$/) ? '*' : '');
		const query = `${queryWithWildCard} ("rdf:type":Library OR "rdf:type":"bibdb:Organization")`;
		url.searchParams.set('_q', query);
	}

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
	const findRes = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`);
	const data = await findRes.json();
	const result = await asLibraryResult(data, displayUtil, vocabUtil, locale);

	return json(result);
};

async function asLibraryResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	vocabUtil: VocabUtil,
	locale: LangCode
): Promise<LibraryResult> {
	const items = await asSearchResultItem(
		view.items,
		displayUtil,
		vocabUtil,
		locale,
		env.AUXD_SECRET
	);
	// need to add the LibraryId to the formatted result since it's wiped
	const withId = items.map((item, index) => ({
		...item,
		thingId: view.items[index][JsonLd.ID],
		str: toString(displayUtil.lensAndFormat(view.items[index], LensType.Chip, locale))
	}));
	return {
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		items: withId
	} as LibraryResult;
}
