import { query } from '$app/server';
import { getSupportedLocale, type LocaleCode } from '$lib/i18n/locales';
import { getSearchResults } from '$lib/remotes/searchResult.remote';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import * as v from 'valibot';

/**
 * TODO: Move featured content data to Libris XL
 **/

type FeaturedQueryType = {
	headingByLang: Record<LocaleCode, string>;
	leadingTextByLang?: Record<LocaleCode, string>;
	footerTextByLang?: Record<LocaleCode, string>;
	findHref: string;
	previewParams: v.InferInput<typeof SearchResultsSchema>;
	showAllLabelByLang?: Record<LocaleCode, string>;
};

const FEATURED_QUERIES: FeaturedQueryType[] = [
	{
		headingByLang: { sv: 'Ny skönlitteratur på svenska', en: 'New fiction in Swedish' },
		findHref:
			'/find?_q=language%3A"lang%3Aswe"+category:"saogf:Sk%25C3%25B6nlitteratur"+excludePreliminary&_sort=-%40reverse.instanceOf.publication.librissearch:year',
		previewParams: {
			_q: 'language:"lang:swe" category:"saogf:Sk%C3%B6nlitteratur" instanceType:PhysicalResource excludePreliminary existsImage',
			_limit: 20,
			_sort: '-@reverse.instanceOf.publication.librissearch:year'
		}
	},
	{
		headingByLang: { sv: 'Tecknade serier för vuxna', en: 'Comics for grown-ups' },
		findHref:
			'/find?_q=category%3A"saogf%3ATecknade%2520serier"+language%3A"lang%3Aswe"+NOT+(+kategori%3A"barngf%3ABarn-%2520och%2520ungdomslitteratur"+OR+intendedAudience%3A"marc%3AJuvenile"+)',
		previewParams: {
			_q: 'category:"saogf:Tecknade%20serier" language:"lang:swe" NOT ( kategori:"barngf:Barn-%20och%20ungdomslitteratur" OR intendedAudience:"marc:Juvenile" ) existsImage',
			_limit: 20,
			_sort: ''
		}
	},
	{
		headingByLang: { sv: 'Nya avhandlingar', en: 'New dissertations' },
		findHref:
			'/find?_q=workCategory%3A"saogf%3AAvhandlingar"&_sort=-%40reverse.instanceOf.publication.librissearch%3Ayear',
		previewParams: {
			_q: 'workCategory:"saogf:Avhandlingar" existsImage',
			_limit: 20,
			_sort: '-@reverse.instanceOf.publication.librissearch:year'
		}
	}
	// {
	// 	headingByLang: {
	// 		sv: 'Analysera mera – facklitteratur inom analys och tolkning',
	// 		en: 'Analyze this – nonfiction on analysis and interpretation'
	// 	},
	// 	findHref: '/find?_q=workCategory:"saogf:Analys%2520och%2520tolkning"',
	// 	previewParams: {
	// 		_q: 'workCategory:"saogf:Analys%20och%20tolkning" existsImage',
	// 		_limit: 20,
	// 		_sort: '-@reverse.instanceOf.publication.librissearch:year'
	// 	}
	// }
];

const FEATURED_QUERIES2: FeaturedQueryType[] = [
	{
		headingByLang: { sv: 'Vidga dina vyer', en: 'Broaden your horizons' },
		leadingTextByLang: {
			sv: 'Skönlitteratur översatt från andra språk än engelska',
			en: 'Fiction translated from languages other than English'
		},
		findHref:
			'/find?_q=kategori%3A"saogf%3ASk%25C3%25B6nlitteratur"+originalLanguage%3A*+language%3A"lang%3Aswe"+NOT+originalLanguage%3A"lang%3Aeng"+yearPublished%3A%282026%29',
		previewParams: {
			_q: 'kategori:"saogf:Sk%C3%B6nlitteratur" originalLanguage:* language:"lang:swe" NOT originalLanguage:"lang:eng" yearPublished:(2026) existsImage',
			_limit: 20
		}
	},
	{
		headingByLang: {
			sv: 'Gröna vanor – vegetariska kokböcker',
			en: 'Green habits – vegetarian cookbooks'
		},
		findHref: '/find?_q=category:"saogf:Kokb%25C3%25B6cker"+subject:"sao:Vegetarisk%2520mat"',
		previewParams: {
			_q: 'category:"saogf:Kokb%C3%B6cker" subject:"sao:Vegetarisk%20mat" existsImage',
			_limit: 20
		}
	},
	{
		headingByLang: { sv: 'Kvinnor i litteraturen', en: 'Women in literature' },
		findHref: '/find?_q=subject:"sao:Kvinnor%2520i%2520litteraturen"',
		previewParams: {
			_q: 'subject:"sao:Kvinnor%20i%20litteraturen" existsImage',
			_limit: 20
		}
	},
	{
		headingByLang: { sv: 'Ny facklitteratur', en: 'New non-fiction' },
		findHref:
			'/find?_q=category:"saogf:Facklitteratur"+yearPublished%3A-2026&_sort=-%40reverse.instanceOf.publication.librissearch:year',
		previewParams: {
			_q: 'category:"saogf:Facklitteratur" yearPublished:-2026 existsImage',
			_limit: 20,
			_sort: '-@reverse.instanceOf.publication.librissearch:year'
		}
	}
	// {
	// 	headingByLang: { sv: 'Lär dig mer om AI', en: 'Learn more about AI' },
	// 	findHref: '/find?_q=subject:"sao:Artificiell%2520intelligens"+category:"saogf:Facklitteratur"',
	// 	previewParams: {
	// 		_q: 'subject:"sao:Artificiell%20intelligens" category:"saogf:Facklitteratur" existsImage',
	// 		_limit: 20
	// 	}
	// },
	// {
	// 	headingByLang: { sv: 'Barnboksklassiker', en: 'Children’s book classics' },
	// 	findHref: '/find?_q=category%3A%28"barngf%3AKlassiker"%29',
	// 	previewParams: {
	// 		_q: 'category:"barngf:Klassiker" existsImage',
	// 		_limit: 20
	// 	}
	// },
	// {
	// 	headingByLang: { sv: 'Lättläst på svenska', en: 'Easy to read in Swedish' },
	// 	findHref:
	// 		'/find?_q=%28kategori:"barngf:L%25C3%25A4ttl%25C3%25A4sta%2520b%25C3%25B6cker"+OR+kategori:"saogf:L%25C3%25A4ttl%25C3%25A4st"%29+språk:"lang:swe"',
	// 	previewParams: {
	// 		_q: '(kategori:"barngf:L%C3%A4ttl%C3%A4sta%20b%C3%B6cker" OR kategori:"saogf:L%C3%A4ttl%C3%A4st") språk:"lang:swe" existsImage',
	// 		_limit: 20
	// 	}
	// },
	// {
	// 	headingByLang: { sv: 'Upptäck Sverige', en: 'Discover Sweden' },
	// 	findHref: '/find?_q=category:"saogf:Guideb%25C3%25B6cker"+subject:"sao:Sverige"',
	// 	previewParams: {
	// 		_q: 'category:"saogf:Guideb%C3%B6cker" subject:"sao:Sverige" existsImage',
	// 		_limit: 20
	// 	}
	// }
];

const FEATURED_COLLECTIONS: FeaturedQueryType[] = [
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
	leadingTextByLang?: string;
	footerTextByLang?: string;
	showAllLabel?: string;
};

export const getFeaturedSearches = query(v.optional(v.string()), async (lang) => {
	const locale = getSupportedLocale(lang);

	const _mapFeaturedQuery = ({
		headingByLang,
		showAllLabelByLang,
		leadingTextByLang,
		footerTextByLang,
		...rest
	}: FeaturedQueryType): FeaturedSearch => ({
		...rest,
		heading: headingByLang[locale],
		leadingTextByLang: leadingTextByLang?.[locale],
		footerTextByLang: footerTextByLang?.[locale],
		showAllLabel: showAllLabelByLang?.[locale]
	});

	const featuredSearches = FEATURED_QUERIES.map(_mapFeaturedQuery);
	const featuredSearches2 = FEATURED_QUERIES2.map(_mapFeaturedQuery);
	const featuredCollections = FEATURED_COLLECTIONS.map(_mapFeaturedQuery);

	return { featuredSearches, featuredSearches2, featuredCollections };
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
