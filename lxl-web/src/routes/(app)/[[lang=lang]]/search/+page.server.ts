import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { DisplayUtil, LensType } from '$lib/utils/xl';
import { getSupportedLocale } from '$lib/i18n/locales';

export const load = async ({ params, locals, fetch, url }) => {
	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}
	
	const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${url.searchParams.toString()}`);


	const result = await recordsRes.json();

	const displayUtil: DisplayUtil = locals.display;

	const items = result.items.map((item) => ({
		fnurgel: new URL(item['@id']).pathname.replace('/', ''),
		'@id': item['@id']
	}));

	const filters = decorateFilters(result, displayUtil, getSupportedLocale(params?.lang));
	const mapping = decorateMapping(result, displayUtil, getSupportedLocale(params?.lang));

	return {
		items,
		filters,
		mapping
	};
};

function decorateFilters(
	result: Record<string, Record<string, unknown>>,
	displayUtil: DisplayUtil,
	locale: string
) {
	// modifies original data...
	const slices = result.stats?.sliceByDimension || {};

	Object.values(slices).forEach((slice) => {
		slice.observation.forEach((observation) => {
			if ('object' in observation) {
				observation.object = displayUtil.format(
					displayUtil.applyLensOrdered(observation.object, LensType.Chip),
					locale
				);
				console.log(observation.object);
			}
		});
	});

	return slices;
}

function decorateMapping(
	result: Record<string, Record<string, unknown>>,
	displayUtil: DisplayUtil,
	locale: string
) {
	const mapping: Array = result.search?.mapping || [];

	mapping.forEach((m) => {
		if ('object' in m) {
			m.object = displayUtil.format(displayUtil.applyLensOrdered(m.object, LensType.Chip), locale);
			console.log(m.object);
		}
	});

	return mapping;
}
