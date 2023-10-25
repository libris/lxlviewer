import { PUBLIC_API_PATH } from '$env/static/public';
import { error } from '@sveltejs/kit';
import { preprocessResources } from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, fetch }) => {
	const [resourcesRes, recordRes] = await Promise.all([
		fetch('/api/resources'),
		fetch(`${PUBLIC_API_PATH}/${params.fnurgel}/data.jsonld`)
	]);
	const resources = preprocessResources(await resourcesRes.json());
	const record = await recordRes.json();

	if (record.status_code === 404) {
		throw error(401, 'Not found');
	}

	const item = record['@graph']?.[1];
	return {
		title: item.hasTitle
			? DisplayUtil.getItemLabel(item?.hasTitle?.[0], resources, {}, { language: 'sv' })
			: 'Titel här',
		tempJson: item
	};
}) satisfies PageServerLoad;
