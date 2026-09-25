import { query } from '$app/server';
import { getSupportedLocale } from '$lib/i18n/locales';
import { getSearchResults } from '$lib/remotes/searchResult.remote';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import type { FeaturedCategoryConfig, FeaturedSearchConfig } from '$lib/types/site';
import * as v from 'valibot';

const FEATURED_COLLECTIONS: FeaturedSearchConfig[] = [
	{
		headingByLang: { sv: 'Särskilda samlingar i Libris', en: 'Special collections in Libris' },
		leadingTextByLang: {
			sv: 'Deldatabaser som omfattar nationalbibliografiska, ämnesspecialiserade och lokala/regionala bibliografier.',
			en: 'Subdatabases that includes national bibliographic, subject-specialized, and local/regional bibliographies.'
		},
		footerTextByLang: { sv: 'Utforska särskilda samlingar', en: 'See all special collections' },
		findHref: '/collections',
		previewParams: {
			_q: 'type:(Bibliography) (000njwvk116zvhz0 OR b3wn529vd2bvdhw1 OR 21vrrs1d40hbfzl3 OR bfcc6ldsd1b7vg8t)',
			_sort: '_sortKeyByLang.sv',
			_limit: 4
		}
	}
];

export type FeaturedSearch = {
	heading: string;
	findHref: string;
	previewParams: v.InferInput<typeof SearchResultsSchema>;
	leadingTextByLang?: string;
	footerTextByLang?: string;
	showAllLabel?: string;
};

export const getFeaturedSearches = query(
	v.object({
		lang: v.optional(v.string()),
		featuredSearches: v.array(v.any()),
		featuredSearches2: v.array(v.any())
	}),
	async ({ lang, featuredSearches, featuredSearches2 }) => {
		const locale = getSupportedLocale(lang);

		const _mapFeaturedQuery = ({
			headingByLang,
			showAllLabelByLang,
			leadingTextByLang,
			footerTextByLang,
			...rest
		}: FeaturedSearchConfig): FeaturedSearch => ({
			...rest,
			heading: headingByLang[locale],
			leadingTextByLang: leadingTextByLang?.[locale],
			footerTextByLang: footerTextByLang?.[locale],
			showAllLabel: showAllLabelByLang?.[locale]
		});

		return {
			featuredSearches: featuredSearches.map(_mapFeaturedQuery),
			featuredSearches2: featuredSearches2.map(_mapFeaturedQuery),
			featuredCollections: FEATURED_COLLECTIONS.map(_mapFeaturedQuery)
		};
	}
);

export const getFeaturedPreviews = query(SearchResultsSchema, async (params) => {
	return getSearchResults(params);
});

export type CategoryShortcut = {
	id: string;
	href: string;
	label: string;
};

export const getFeaturedCategories = query(
	v.object({
		lang: v.optional(v.string()),
		featuredCategories: v.array(v.any())
	}),
	async ({ lang, featuredCategories }): Promise<CategoryShortcut[]> => {
		const locale = getSupportedLocale(lang);

		return featuredCategories.map(({ labelByLang, ...rest }: FeaturedCategoryConfig) => ({
			...rest,
			label: labelByLang[locale]
		}));
	}
);
