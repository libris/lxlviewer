import { query } from '$app/server';
import { getSupportedLocale, type LocaleCode } from '$lib/i18n/locales';
import { getSearchResults } from '$lib/remotes/searchResult.remote';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import * as v from 'valibot';

/**
 * TODO: Move featured content data to Libris XL
 **/

const FEATURED_QUERIES: {
	headingByLang: Record<LocaleCode, string>;
	findHref: string;
	previewParams: v.InferInput<typeof SearchResultsSchema>;
	showAllLabelByLang?: Record<LocaleCode, string>;
}[] = [
	{
		headingByLang: { sv: 'Ny skönlitteratur på svenska', en: 'New fiction in Swedish' },
		findHref:
			'/find?_q=language%3A"lang%3Aswe"+category:"saogf:Sk%25C3%25B6nlitteratur"&_sort=-%40reverse.instanceOf.publication.year',
		previewParams: {
			_q: 'language:"lang:swe" category:"saogf:Sk%C3%B6nlitteratur" existsImage',
			_limit: 20,
			_sort: '-@reverse.instanceOf.publication.year'
		}
	},
	{
		headingByLang: { sv: 'Ny facklitteratur', en: 'New non-fiction' },
		findHref:
			'/find?_q=category:"saogf:Facklitteratur"+yearPublished%3A-2026&_sort=-%40reverse.instanceOf.publication.year',
		previewParams: {
			_q: 'category:"saogf:Facklitteratur" yearPublished:-2026 existsImage',
			_limit: 20,
			_sort: '-@reverse.instanceOf.publication.year'
		}
	},
	{
		headingByLang: { sv: 'Böcker om att börja skolan', en: 'Books about starting school' },
		findHref: '/find?_q=category:"barngf:Bilderböcker"+subject:"barn:B%25C3%25B6rja%2520skolan"',
		previewParams: {
			_q: 'category:"saogf:Sk%C3%B6nlitteratur" category:"barngf:Bilderb%C3%B6cker" subject:"barn:B%C3%B6rja%20skolan" existsImage',
			_limit: 20
		}
		// showAllLabelByLang: { sv: 'Visa fler titlar', en: 'Show more titles' }
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
		id: 'all-categories',
		href: '/find?_q=',
		labelByLang: {
			sv: 'Allt',
			en: 'All'
		}
	},
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
		id: 'periodical-category',
		href: '/find?_q=category:"saogf:Periodika"',
		labelByLang: {
			sv: 'Periodika',
			en: 'Periodicals'
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
		href: '/find?_q=category:"https://id.kb.se/term/ktg/MovingImage"',
		labelByLang: {
			sv: 'Rörlig bild',
			en: 'Moving image'
		}
	},
	{
		id: 'software-category',
		href: '/find?_q=category:"https://id.kb.se/term/ktg/Software"',
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
	showAllLabel?: string;
};

export const getFeaturedSearches = query(v.optional(v.string()), async (lang) => {
	const locale = getSupportedLocale(lang);

	const featuredSearches: FeaturedSearch[] = FEATURED_QUERIES.map(
		({ headingByLang, showAllLabelByLang, ...rest }) => ({
			...rest,
			heading: headingByLang[locale],
			showAllLabel: showAllLabelByLang?.[locale]
		})
	);

	return featuredSearches;
});

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
