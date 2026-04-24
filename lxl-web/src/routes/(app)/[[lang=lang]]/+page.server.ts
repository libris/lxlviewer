import type { PageServerLoad } from './$types';
import { getFeaturedSearches } from '$lib/remotes/homepage.remote';

export const load = (async ({ params: { lang } }) => {
	const { featuredSearches, featuredSearches2, featuredCollections } =
		await getFeaturedSearches(lang);

	return { featuredSearches, featuredSearches2, featuredCollections };
}) satisfies PageServerLoad;
