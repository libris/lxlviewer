import { initLxljsUtils } from 'lxljs';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = (async ({ fetch }) => {
	const resourcesRes = await fetch('/api/resources');
	const lxlResources = await resourcesRes.json();
	const lxlSettings = { language: 'sv' };
	/**
	 * Instantiate util functions from LXLJS with repetitively passed data (`resources` and `settings`)
	 * Another alternative could be to instantiate the functions as module context at build time... */
	const lxljsUtils = initLxljsUtils(lxlResources, lxlSettings);

	return {
		...lxljsUtils,
		resources: lxlResources
	};
}) satisfies LayoutLoad;
