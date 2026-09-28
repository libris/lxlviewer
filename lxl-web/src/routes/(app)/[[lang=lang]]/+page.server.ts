import type { PageServerLoad } from './$types';
import { defaultFeaturedSearches, defaultFeaturedSearches2 } from '$lib/constants/featuredSearches';
import { defaultFeaturedCategories } from '$lib/constants/featuredCategories';
import { getFeaturedCategories, getFeaturedSearches } from '$lib/remotes/homepage.remote';

export const load = (async ({ params: { lang }, locals }) => {
	const { featuredSearches, featuredSearches2, featuredCollections } = await getFeaturedSearches({
		lang,
		featuredSearches: locals.site?.configuration?.featuredSearches ?? defaultFeaturedSearches,
		featuredSearches2: locals.site?.configuration?.featuredSearches2 ?? defaultFeaturedSearches2
	});

	const featuredCategories = await getFeaturedCategories({
		lang,
		featuredCategories: locals.site?.configuration?.featuredCategories ?? defaultFeaturedCategories
	});

	return { featuredSearches, featuredSearches2, featuredCollections, featuredCategories };
}) satisfies PageServerLoad;
