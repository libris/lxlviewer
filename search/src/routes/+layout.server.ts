import type { LayoutServerLoad } from './$types';
import { preprocessResources } from 'lxljs/vocab';

export const load: LayoutServerLoad = (async ({ fetch }) => {
	const resourcesRes = await fetch('/api/resources');
	const resources = preprocessResources(await resourcesRes.json());

	return {
		resources
	};
}) satisfies LayoutServerLoad;
