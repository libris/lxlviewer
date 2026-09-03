import { query } from '$app/server';
import { getSupportedLocale, type LocaleCode } from '$lib/i18n/locales';
import { getSearchResults } from '$lib/remotes/searchResult.remote';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import type { FeaturedSearchConfig } from '$lib/types/site';
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

/**
 * TODO: Get category data from Libris XL
 */

const CATEGORY_SHORTCUTS: {
	id: string;
	href: string;
	labelByLang: Record<LocaleCode, string>;
}[] = [
	{
		id: 'fiction-category',
		href: '/find?_q=category:"saogf:Sk%25C3%25B6nlitteratur"',
		labelByLang: {
			sv: 'Skönlitteratur',
			en: 'Literature'
		}
	},
	{
		id: 'nonfiction-category',
		href: '/find?_q=category:"saogf:Facklitteratur"',
		labelByLang: {
			sv: 'Facklitteratur',
			en: 'Non-fiction literature'
		}
	},
	{
		id: 'serials-category',
		href: '/find?_q=category:"saogf:Seriella%20publikationer"',
		labelByLang: {
			sv: 'Tidningar och periodika',
			en: 'Newspapers and Periodicals'
		}
	},
	{
		id: 'music-category',
		href: '/find?_q=category:"saogf:Musik"',
		labelByLang: {
			sv: 'Musik',
			en: 'Music'
		}
	},
	{
		id: 'movingimage-category',
		href: '/find?_q=category:"ktg:MovingImage"',
		labelByLang: {
			sv: 'Rörlig bild',
			en: 'Moving image'
		}
	},
	{
		id: 'software-category',
		href: '/find?_q=category:"ktg:Software"',
		labelByLang: {
			sv: 'Mjukvara',
			en: 'Software'
		}
	},
	{
		id: 'picture-category',
		href: '/find?_q=category:"saogf:Bilder"',
		labelByLang: {
			sv: 'Bilder',
			en: 'Pictures'
		}
	},
	{
		id: 'cartographic-category',
		href: '/find?_q=category:"saogf:Kartografiskt%2520material"',
		labelByLang: {
			sv: 'Kartografiskt material',
			en: 'Cartographic material'
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

export const getCategoryShortcuts = query(v.optional(v.string()), async (lang) => {
	const locale = getSupportedLocale(lang);

	const categoryShortcuts: CategoryShortcut[] = CATEGORY_SHORTCUTS.map(
		({ labelByLang, ...rest }) => ({
			...rest,
			label: labelByLang[locale]
		})
	);

	return categoryShortcuts;
});
