import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { getSupportedLocale, type LocaleCode as LangCode } from '$lib/i18n/locales.js';
import type { LibraryResult, PartialCollectionView } from '$lib/types/search';
import { DisplayUtil, toString } from '$lib/utils/xl';
import { JsonLd, LensType } from '$lib/types/xl';

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);

	let _q = url.searchParams.get('_q') || '';

	if (_q.length !== 0) {
		_q = `${_q} "rdf:type":Library`;
		url.searchParams.set('_q', _q);
	}

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
	const findRes = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`);
	const data = await findRes.json();
	const result = await asLibraryResult(data, displayUtil, locale);

	return json(result);
};

async function asLibraryResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode
): Promise<LibraryResult> {
	return {
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		items: view.items?.map((i) => ({
			[JsonLd.ID]: i.meta[JsonLd.ID] as string,
			label: toString(displayUtil.lensAndFormat(i, LensType.Chip, locale)) as string,
			sigel: i.sigel as string
		}))
	};
}
