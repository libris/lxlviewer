import { query } from '$app/server';
import { getSupportedLocale, type LocaleCode } from '$lib/i18n/locales';
import { getSearchResults } from '$lib/remotes/searchResult.remote';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import * as v from 'valibot';

export const getFeaturedSearches = query(v.optional(v.string()), async (lang) => {
	/**
	 * TODO: Move data to LibrisXL so we easily can update the start page contents without needing to rebuild the app
	 */
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
				_limit: 10,
				_sort: '-@reverse.instanceOf.publication.year'
			}
		},
		{
			headingByLang: { sv: 'Ny facklitteratur', en: 'New non-fiction' },
			findHref:
				'/find?_q=category:"saogf:Facklitteratur"+yearPublished%3A-2026&_sort=-%40reverse.instanceOf.publication.year',
			previewParams: {
				_q: 'category:"saogf:Facklitteratur" yearPublished:-2026 existsImage',
				_limit: 10,
				_sort: '-@reverse.instanceOf.publication.year'
			}
		},
		{
			headingByLang: { sv: 'Böcker om att börja skolan', en: 'Books about starting school' },
			findHref: '/find?_q=category:"barngf:Bilderböcker"+subject:"barn:B%25C3%25B6rja%2520skolan"',
			previewParams: {
				_q: 'category:"saogf:Sk%C3%B6nlitteratur" category:"barngf:Bilderb%C3%B6cker" subject:"barn:B%C3%B6rja%20skolan" existsImage',
				_limit: 10
			},
			showAllLabelByLang: { sv: 'Visa fler titlar', en: 'Show more titles' }
		}
	];
	const locale = getSupportedLocale(lang);

	const previewSearchResults = await Promise.all(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(FEATURED_QUERIES).map(async ([_, { previewParams }]) => {
			return getSearchResults(previewParams);
		})
	);

	const featuredSearches = FEATURED_QUERIES.map(
		({ headingByLang, showAllLabelByLang, ...rest }, index) => ({
			...rest,
			items: previewSearchResults[index].items,
			heading: headingByLang[locale],
			showAllLabel: showAllLabelByLang?.[locale]
		})
	);

	return featuredSearches;
});
