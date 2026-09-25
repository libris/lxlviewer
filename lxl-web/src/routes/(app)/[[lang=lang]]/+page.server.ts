import type { PageServerLoad } from './$types';
import { defaultSiteConfiguration } from '$lib/constants/defaultSiteConfig';
import { getFeaturedCategories, getFeaturedSearches } from '$lib/remotes/homepage.remote';

export const load = (async ({ params: { lang }, locals }) => {
	const { featuredSearches, featuredSearches2, featuredCollections } = await getFeaturedSearches({
		lang,
		featuredSearches:
			locals.site?.configuration?.featuredSearches ?? defaultSiteConfiguration.featuredSearches,
		featuredSearches2:
			locals.site?.configuration?.featuredSearches2 ?? defaultSiteConfiguration.featuredSearches2
	});

	const featuredCategories = await getFeaturedCategories({
		lang,
		featuredCategories:
			locals.site?.configuration?.featuredCategories ?? defaultSiteConfiguration.featuredCategories
	});

	return { featuredSearches, featuredSearches2, featuredCollections, featuredCategories };
}) satisfies PageServerLoad;
