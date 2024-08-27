import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import type { Qualifier } from '$lib/types/qualifier';
import type { AutocompleteSuggestion } from '$lib/types/autocomplete';
import { env } from '$env/dynamic/private';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
import { type PartialCollectionView } from '../../../../_tempRoutes/(app)/[[lang=lang]]/(find)/search';
import { relativizeUrl } from '$lib/utils/http';
import { LxlLens } from '$lib/utils/display.types';
import getValidQualifiers from '$lib/utils/codemirror/getValidQualifiers';

/** TODO:
 * Search by property key if exists in the beginning of the part
 */

export const GET: RequestHandler = async ({ url, params, fetch, locals }) => {
	const displayUtil = locals.display;
	const lang = params.lang || 'sv';

	const q = url.searchParams.get('_q');
	if (!q) {
		return error(400, 'Missing _q param value');
	}

	const editedRange = url.searchParams
		.get('editedRange')
		?.split(',')
		.map((n) => parseInt(n, 10));
	if (!editedRange || editedRange.some(isNaN)) {
		return error(400, 'Invalid editedRange param value');
	}

	const qualifiersRes = await fetch('/api/autocomplete/qualifiers');
	const qualifiers = (await qualifiersRes.json()) as Qualifier[];

	const usedQualifierMatches = [
		...q.matchAll(
			/(?<!\S+)([0-9a-zA-ZaåöAÅÖ]+):((")?[0-9a-zA-ZaåöAÅÖ:]+\3?)?/g // regex probalby needs modification
		)
	];

	const usedQualifiers = usedQualifierMatches.map((item) => {
		const [match, name, value] = item;
		return { name, value, range: { from: item.index, to: match.length + item.index } };
	});

	const { valid: validQualifiers, invalid: invalidQualifiers } = getValidQualifiers(
		qualifiers,
		usedQualifiers
	);

	const editedRangeValue = q.slice(editedRange[0], editedRange[1]);
	const editedQualifier = editedRangeValue.match(
		/^(?<!\S+)([0-9a-zA-ZaåöAÅÖ]+):((")?[0-9a-zA-ZaåöAÅÖ:]+\3?)?$/
	);

	if (editedQualifier) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, name, value] = editedQualifier;

		const validEditedQualifier = qualifiers.find((qualifierItem) => qualifierItem.name === name);

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
			const processedQualifiedRecords: AutocompleteSuggestion[] = qualifiedRecords.items?.map(
				(item) => {
					const relativeId = relativizeUrl(item['@id'] as string)?.replace('#it', '');

					return {
						'@id': item['@id'] as string,
						'@type': item['@type'] as string,
						label: displayUtil.lensAndFormat(item, LxlLens.CardHeading, lang),
						description: 'description',
						replacement: `${name}:${relativeId}`
					};
				}
			);

			return json({
				records: processedQualifiedRecords,
				validQualifiers,
				invalidQualifiers
			});
		}
		// 2. check range and/or rangesInclude and search on these as type! (kanske även domainIncludes)
		// 3. BOOYAH!
	}

	return json({ validQualifiers, invalidQualifiers });
};
