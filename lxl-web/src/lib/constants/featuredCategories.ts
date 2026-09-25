import type { FeaturedCategoryConfig } from '$lib/types/site';

/**
 * TODO: Get category data from Libris XL
 */

export const defaultFeaturedCategories: FeaturedCategoryConfig[] = [
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
