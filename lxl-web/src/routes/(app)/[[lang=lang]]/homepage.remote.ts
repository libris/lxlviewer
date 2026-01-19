import { query } from '$app/server';
import type { LocaleCode } from '$lib/i18n/locales';
import { getSearchResults } from '$lib/remotes/searchResult.remote';

export const getFeaturedSearches = query(async () => {
	const FEATURED_QUERIES: {
		headingByLang: Record<LocaleCode, string>;
		findHref: string;
		previewParams: Record<string, string | number | boolean>;
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

	const previewSearchResults = await Promise.all(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(FEATURED_QUERIES).map(async ([_, { previewParams }]) => {
			const params = { ...previewParams };
			console.log('params', params);
			return getSearchResults(previewParams);
		})
	);

	const featuredSearches = FEATURED_QUERIES.map((item, index) => ({
		...item,
		items: previewSearchResults[index].items
	}));

	return featuredSearches;
});
