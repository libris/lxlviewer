import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { toString, JsonLd } from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';
import getEditedParts from '$lib/utils/codemirror/getEditedParts';
import type { PartialCollectionView } from '$lib/utils/search';

/** TODO:
 * Search by property key if exists in the beginning of the part
 */

export const GET: RequestHandler = async ({ url, params, locals, fetch }) => {
	const displayUtil = locals.display;
	const lang = params.lang || 'sv';
	const q = url.searchParams.get('q');
	const cursor = url.searchParams.get('c');

	if (!q) {
		return error(400, 'Missing _q param value');
	}
	if (!cursor) {
		return error(400, 'Missing cursor param value');
	}
	if (isNaN(parseInt(cursor, 10))) {
		return error(400, 'Invalid cursor param value (should be parseable as number)');
	}

	const { word, phrase, qualifierLikeName, qualifierLikeValue } = getEditedParts({
		q,
		cursor: parseInt(cursor, 10)
	});

	if (qualifierLikeName) {
		console.log('qualifierlike', qualifierLikeName, 'value', qualifierLikeValue);
		return json({ items: [] });
	}

	console.log('word', word, 'phrase', phrase);
	const aggregateRes = await fetch(
		`/api/${lang ? `${lang}/` : ''}autocomplete/aggregate?q=${phrase}`
	);
	const aggregate = (await aggregateRes.json()) as PartialCollectionView;

	const items =
		aggregate.items?.map((item) => {
			return {
				[JsonLd.ID]: item?.['@id'],
				[JsonLd.TYPE]: item?.['@type'],
				label: toString(displayUtil.lensAndFormat(item, LxlLens.CardHeading, lang)),
				totalReverseLinks: item?.reverseLinks?.totalItems || 0
			};
		}) || [];

	return json({ items });
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
