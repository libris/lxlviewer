import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { toString, JsonLd } from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';
import type { PartialCollectionView } from '$lib/utils/search';
import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
import getQualifierSuggestion, {
	type QualifierSuggestion
} from '$lib/utils/supersearch/getQualifierSuggestion.server';
import { relativizeUrl } from '$lib/utils/http';

const SearchParamsSchema = z.object({
	q: z.string(),
	type: z.enum(['qualifier', 'work']),
	wordRange: z
		.string()
		.transform((value) => value.split(',').map((value) => parseInt(value, 10)))
		.pipe(z.number().array().length(2))
		.transform(([from, to]) => ({
			from,
			to
		}))
		.or(z.null()),
	phraseRange: z
		.string()
		.transform((value) => value?.split(',').map((value) => parseInt(value, 10)))
		.pipe(z.number().array().length(2))
		.transform(([from, to]) => ({
			from,
			to
		}))
		.or(z.null())
});

export type SuggestSearchParamsSchema = z.input<typeof SearchParamsSchema>;

export type Suggestion = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	typeLabel: string;
	inSchemeLabel?: string;
	inSchemeCode?: string;
	heading: string;
	fnurgel: string;
	totalReverseLinks: number;
	qualifier?: QualifierSuggestion;
};

export type SuggestResponse = {
	items: Suggestion[];
	totalItems: number;
	itemOffset: number;
	itemsPerPage: number;
};

export const GET: RequestHandler = async ({ url, params, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;

	const lang = params.lang || 'sv';

	const { data: dataFromSearchParams, error: searchParamsError } = SearchParamsSchema.safeParse({
		q: url.searchParams.get('q'),
		type: url.searchParams.get('type'),
		wordRange: url.searchParams.get('wordRange'),
		phraseRange: url.searchParams.get('phraseRange')
	});

	if (searchParamsError) {
		error(400, searchParamsError.message); // TODO: format zod error messages
	}

	const { q, type, wordRange, phraseRange } = dataFromSearchParams;

	const editedRange = phraseRange || wordRange;
	const word = wordRange ? q.slice(wordRange.from, wordRange.to) : null;
	const phrase = phraseRange ? q.slice(phraseRange.from, phraseRange.to) : null;

	const findRes = await fetch(
		`${env.API_URL}/find.jsonld?${new URLSearchParams(
			type === 'qualifier'
				? [
						['q', sanitizeQSearchParamValue(phrase || word)], // TODO: fetch phrase or word in parallel (if phrase doesn't give any results fall back to word). If both gives the same result use word (so only the last occurrence of Astrid Astrid has qualifier changes)
						['@type', 'Agent'],
						['@type', 'Concept'],
						['@type', 'Language'],
						['not-@type', 'ComplexSubject'], // Should it be "unboosted" instead?
						['not-inScheme.@id', 'https://id.kb.se/term/swepub'],
						['not-inScheme.@id', 'https://id.kb.se/marc'],
						['min-reverseLinks.totalItems', '1'],
						['_limit', '4'],
						['_offset', '0'],
						['_sort', '']
					]
				: [
						['q', sanitizeQSearchParamValue(q)],
						['not-inCollection.@id', 'https://id.kb.se/term/uniformWorkTitle'],
						['@type', 'Work'],
						['_limit', '4'],
						['_offset', '0'],
						['_sort', '']
					]
		).toString()}`
	);

	if (findRes.status !== 200) {
		error(findRes.status, findRes.statusText);
	}

	const findResult = (await findRes.json()) as PartialCollectionView;

	const suggestions = findResult.items?.map((item): Suggestion => {
		return {
			[JsonLd.ID]: item?.[JsonLd.ID] as string,
			[JsonLd.TYPE]: item?.[JsonLd.TYPE] as string,
			typeLabel: toString(
				displayUtil.lensAndFormat(
					vocabUtil.getDefinition(
						Array.isArray(item?.[JsonLd.TYPE]) ? item[JsonLd.TYPE][0] : item[JsonLd.TYPE]
					),
					LxlLens.CardHeading,
					lang
				)
			),
			inSchemeLabel: item.inScheme
				? toString(displayUtil.lensAndFormat(item.inScheme, LxlLens.CardHeading, lang))
				: undefined,
			inSchemeCode: item?.inScheme?.code,
			heading: toString(displayUtil.lensAndFormat(item, LxlLens.PageHeading, lang)),
			fnurgel: relativizeUrl(item?.meta?.['@id']) as string,
			totalReverseLinks: item?.reverseLinks?.totalItems || 0,
			qualifier:
				type === 'qualifier' && editedRange
					? getQualifierSuggestion({
							query: q,
							item,
							itemBaseClasses: vocabUtil.getBaseClasses(item?.['@type'] as string),
							editedRange
						})
					: undefined
		};
	});

	return json({
		items: suggestions,
		totalItems: findResult.totalItems,
		itemOffset: findResult.itemOffset,
		itemsPerPage: findResult.itemsPerPage
	} satisfies SuggestResponse);
};
