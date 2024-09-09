import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { toString, JsonLd } from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';
import type { PartialCollectionView } from '$lib/utils/search';
import getAutocompleteFindSearchParams from '$lib/utils/supersearch/getAutocompleteFindSearchParams.server';

/** TODO:
 * Search by property key if exists in the beginning of the part
 */

export const GET: RequestHandler = async ({ url, params, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;

	const lang = params.lang || 'sv';

	const types = url.searchParams.getAll('@type');
	const full = url.searchParams.get('full');
	const word = url.searchParams.get('word');
	const phrase = url.searchParams.get('phrase');

	if (!types) {
		error(400, 'Missing @type param value');
	}

	if (!full) {
		error(400, 'Missing full param value');
	}

	/** Should check if qualifier-like here... */

	const findRes = await fetch(
		`${env.API_URL}/find.jsonld?${getAutocompleteFindSearchParams({ types, q: phrase || word || full, lang }).toString()}` // TODO: first fetch phrase or word in parallel with q (if phrase doesn't give any results fall back to word)
	);

	if (findRes.status !== 200) {
		error(findRes.status, findRes.statusText);
	}

	const findResult = (await findRes.json()) as PartialCollectionView;

	const autocompleteItems = findResult.items?.map((item) => {
		return {
			[JsonLd.ID]: item?.['@id'],
			[JsonLd.TYPE]: Array.isArray(item?.['@type']) ? item['@type'][0] : item?.['@type'],
			label: toString(displayUtil.lensAndFormat(item, LxlLens.CardHeading, lang)),
			typeLabel: toString(
				displayUtil.lensAndFormat(
					vocabUtil.getDefinition(
						Array.isArray(item?.['@type']) ? item['@type'][0] : item?.['@type']
					),
					LxlLens.CardHeading,
					lang
				)
			),
			inSchemeLabel: item.inScheme
				? toString(displayUtil.lensAndFormat(item.inScheme, LxlLens.CardHeading, lang))
				: undefined,
			inSchemeCode: item?.inScheme?.code,
			totalReverseLinks: item?.reverseLinks?.totalItems || 0
		};
	});

	return json(autocompleteItems);
};

/*


		// 2. check range and/or rangesInclude and search on these as type! (kanske även domainIncludes)
		// 3. BOOYAH!

		const validEditedQualifier = qualifiers?.find(
			(qualifierItem) => qualifierItem.name === name && qualifierItem.valid
		);

		if (validEditedQualifier) {
			const relatedTypes = [
				...new Set(
					[
						...(validEditedQualifier?.item?.domainIncludes || []),
						...(validEditedQualifier?.item?.rangeIncludes || [])
					].map((typeItem) => typeItem?.['@id']?.split('/').pop())
				)
			].filter((type) => !(name === 'subject' && type === 'Work')); // NOTE: filtered out work for demonstration purposes

			const qualifiedSearchParams = getSortedSearchParams(
				addDefaultSearchParams(new URLSearchParams())
			);

			const relatedTypesQueryPart =
				'(' + relatedTypes.map((type) => `"rdf:type":${type}`).join(' OR ') + ')';
			// qualifiedSearchParams.set(`exists-${value}`, 'true'); // should we encodeURI?
			qualifiedSearchParams.set('_q', `${value || '*'} ${relatedTypesQueryPart}`);

			const qualifiedRecordsRes = await fetch(
				`${env.API_URL}/find.jsonld?${qualifiedSearchParams.toString()}`
			);
			const qualifiedRecords = (await qualifiedRecordsRes.json()) as PartialCollectionView;
			const processedQualifiedRecords = qualifiedRecords.items?.map((item) => {
				const relativeId = relativizeUrl(item['@id'] as string)?.replace('#it', '');

				return {
					'@id': item['@id'] as string,
					'@type': item['@type'] as string,
					label: displayUtil.lensAndFormat(item, LxlLens.CardHeading, lang),
					description: 'description',
					replacement: `${name}:${relativeId}`
				};
			});

			items = processedQualifiedRecords;
		}
		*/
