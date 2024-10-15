import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { toString, JsonLd } from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';
import type { PartialCollectionView, SearchMapping } from '$lib/utils/search';
import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
import {
	getQualifier,
	getQualifierChanges,
	type QualifierChanges,
	type Qualifier
} from '$lib/utils/supersearch/qualifiers';
import QUALIFIER_TYPES_BY_BASE_CLASS from '$lib/assets/json/qualifierTypeByBaseClass.json';
import { relativizeUrl } from '$lib/utils/http';

const FindType = z.enum(['qualifier', 'work']);

const SearchParamsSchema = z.object({
	q: z.string(),
	type: FindType,
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
		.or(z.null()),
	qualifierType: z.string().or(z.null()),
	qualifierValue: z.string().or(z.null())
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
	qualifier?: Qualifier;
	changes?: QualifierChanges;
};

export type SuggestResponse = {
	items: Suggestion[];
	totalItems: number;
	itemOffset: number;
	itemsPerPage: number;
	searchMappings: SearchMapping[];
};

export const GET: RequestHandler = async ({ url, params, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;

	const lang = params.lang || 'sv';

	const { data: dataFromSearchParams, error: searchParamsError } = SearchParamsSchema.safeParse({
		q: url.searchParams.get('q'),
		type: url.searchParams.get('type'),
		wordRange: url.searchParams.get('wordRange'),
		phraseRange: url.searchParams.get('phraseRange'),
		qualifierType: url.searchParams.get('qualifierType'),
		qualifierValue: url.searchParams.get('qualifierValue')
	});

	if (searchParamsError) {
		error(400, searchParamsError.message); // TODO: format zod error messages
	}

	const { q, type, wordRange, phraseRange, qualifierType, qualifierValue } = dataFromSearchParams;

	const editedRange = phraseRange || wordRange;
	const word = wordRange ? q.slice(wordRange.from, wordRange.to) : null;
	const phrase = phraseRange ? q.slice(phraseRange.from, phraseRange.to) : null;

	const findResSearchParams = getFindResSearchParams({
		q,
		type,
		word,
		phrase,
		qualifierType,
		qualifierValue
	});

	const findRes = await fetch(`${env.API_URL}/find.jsonld?${findResSearchParams.toString()}`);

	if (findRes.status !== 200) {
		error(findRes.status, findRes.statusText);
	}

	const findResult = (await findRes.json()) as PartialCollectionView;

	const suggestions = findResult.items?.map((item): Suggestion => {
		const qualifier = getQualifier({ item, lang });
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
			...(qualifier &&
				editedRange && {
					qualifier,
					changes: getQualifierChanges({ qualifier, query: q, editedRange })
				})
		};
	});

	return json({
		items: suggestions,
		totalItems: findResult.totalItems,
		itemOffset: findResult.itemOffset,
		itemsPerPage: findResult.itemsPerPage,
		searchMappings: findResult.search.mapping
	} satisfies SuggestResponse);
};

function getFindResSearchParams({
	q,
	type,
	word,
	phrase,
	qualifierType,
	qualifierValue
}: {
	q: string;
	type: z.infer<typeof FindType>;
	word: string | null;
	phrase: string | null;
	qualifierType: string | null;
	qualifierValue: string | null;
}) {
	if (type === 'work') {
		return new URLSearchParams([
			['_q', sanitizeQSearchParamValue(q)],
			['_limit', '5'],
			['_offset', '0'],
			['_sort', '']
		]);
	}

	if (qualifierType && qualifierValue) {
		const baseClass = Object.entries(QUALIFIER_TYPES_BY_BASE_CLASS).find(
			([, type]) => type === qualifierType
		)?.[0];

		if (baseClass) {
			return new URLSearchParams([
				['q', qualifierValue], // TODO: fetch phrase or word in parallel (if phrase doesn't give any results fall back to word). If both gives the same result use word (so only the last occurrence of Astrid Astrid has qualifier changes)
				['@type', baseClass || ''],
				['min-reverseLinks.totalItems', '1'],
				['_limit', '5'],
				['_offset', '0'],
				['_sort', '']
			]);
		} else {
			console.error('could not find base class');
		}
	}

	return new URLSearchParams([
		['q', sanitizeQSearchParamValue(phrase || word)], // TODO: fetch phrase or word in parallel (if phrase doesn't give any results fall back to word). If both gives the same result use word (so only the last occurrence of Astrid Astrid has qualifier changes)
		['@type', 'Agent'],
		['@type', 'Concept'],
		['@type', 'Language'],
		['not-@type', 'ComplexSubject'], // Should it be "unboosted" instead?
		['not-inScheme.@id', 'https://id.kb.se/term/swepub'],
		['not-inScheme.@id', 'https://id.kb.se/marc'],
		['min-reverseLinks.totalItems', '1'],
		['_limit', '5'],
		['_offset', '0'],
		['_sort', '']
	]);
}
