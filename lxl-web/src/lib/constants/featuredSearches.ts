import type { FeaturedSearchConfig } from '$lib/types/site';

export const defaultFeaturedSearches: FeaturedSearchConfig[] = [
	{
		headingByLang: { sv: 'Ny skönlitteratur på svenska', en: 'New fiction in Swedish' },
		findHref:
			'/find?_q=language%3A"lang%3Aswe"+category:"saogf:Sk%25C3%25B6nlitteratur"+excludePreliminary&_sort=-%40reverse.instanceOf.publication.librissearch:year',
		previewParams: {
			_q: 'language:"lang:swe" category:"saogf:Sk%C3%B6nlitteratur" instanceType:PhysicalResource excludePreliminary existsImage NOT (instanceCategory:"https://id.kb.se/term/saobf/Braille" meta.@type:(VirtualRecord))',
			_limit: 20,
			_sort: '-@reverse.instanceOf.publication.librissearch:year'
		}
	},
	{
		headingByLang: { sv: 'Tecknade serier för vuxna', en: 'Comics for grown-ups' },
		findHref: '/find?_q=workCategory:"saogf:Serieromaner"',
		previewParams: {
			_q: 'workCategory:"saogf:Serieromaner" existsImage',
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

export const defaultFeaturedSearches2: FeaturedSearchConfig[] = [
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
			_q: 'category:"saogf:Facklitteratur" yearPublished:-2026 existsImage NOT (instanceCategory:"https://id.kb.se/term/saobf/Braille" meta.@type:(VirtualRecord))',
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
