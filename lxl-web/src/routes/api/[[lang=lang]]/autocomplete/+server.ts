import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { toString, JsonLd } from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';
import type { PartialCollectionView } from '$lib/utils/search';
import getDisplayType from '$lib/utils/getDisplayType';
import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
import QUALIFIER_TYPES_BY_BASE_CLASS from '$lib/assets/json/qualifierTypeByBaseClass.json';
import getQualifierValue from '$lib/utils/supersearch/getQualifierValue.server';

/** TODO:
 * Search by property key if exists in the beginning of the part
 */

export const GET: RequestHandler = async ({ url, params, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;

	const lang = params.lang || 'sv';

	const searchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);

	/** Get endpoint specific query values then delete them from the search params as the LibrisXL API doesn't support them... */
	const full = searchParams.get('full');
	const word = searchParams.get('word');
	const phrase = searchParams.get('phrase');
	const overview = searchParams.get('overview');

	searchParams.delete('full');
	searchParams.delete('word');
	searchParams.delete('phrase');
	searchParams.delete('overview');

	if (!full) {
		error(400, 'Missing full param value');
	}

	/** Should check if qualifier-like here... */

	searchParams.set('q', sanitizeQSearchParamValue(phrase || word || full));
	const findRes = await fetch(
		`${env.API_URL}/find.jsonld?${searchParams.toString()}` // TODO: first fetch phrase or word in parallel with q (if phrase doesn't give any results fall back to word)
	);

	if (findRes.status !== 200) {
		error(findRes.status, findRes.statusText);
	}

	const findResult = (await findRes.json()) as PartialCollectionView;

	const autocompleteItems = findResult.items?.map((item) => {
		const displayType = getDisplayType(item?.['@type'] as string);

		const qualifierType = Object.entries(QUALIFIER_TYPES_BY_BASE_CLASS).find(
			([qualifiedBaseClass]) =>
				vocabUtil.getBaseClasses(item?.['@type'] as string).includes(qualifiedBaseClass)
		)?.[1];

		const qualifierValue = getQualifierValue(item);

		return {
			[JsonLd.ID]: item?.['@id'],
			[JsonLd.TYPE]: displayType,
			heading: toString(displayUtil.lensAndFormat(item, LxlLens.PageHeading, lang)),
			overview: overview
				? toString(displayUtil.lensAndFormat(item, LxlLens.PageOverView, lang))
				: null,
			typeLabel: toString(
				displayUtil.lensAndFormat(vocabUtil.getDefinition(displayType), LxlLens.CardHeading, lang)
			),
			inSchemeLabel: item.inScheme
				? toString(displayUtil.lensAndFormat(item.inScheme, LxlLens.CardHeading, lang))
				: undefined,
			inSchemeCode: item?.inScheme?.code,
			totalReverseLinks: item?.reverseLinks?.totalItems || 0,
			qualifierType,
			qualifierValue
		};
	});

	return json({
		items: autocompleteItems,
		totalItems: findResult.totalItems,
		itemOffset: findResult.itemOffset,
		itemsPerPage: findResult.itemsPerPage
	});
};
