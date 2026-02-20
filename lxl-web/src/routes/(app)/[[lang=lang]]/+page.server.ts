import type { PageServerLoad } from './$types';
import { getFeaturedSearches } from '$lib/remotes/homepage.remote';

export const load = (async ({ params: { lang } }) => {
	const featuredSearches = await getFeaturedSearches(lang);
	return { featuredSearches };
}) satisfies PageServerLoad;
