import { PUBLIC_API_PATH } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch, parent }) => {
	const res = await fetch(`${PUBLIC_API_PATH}/${params.fnurgel}/data.jsonld`);
	const record = await res.json();

	if (record.status_code === 404) {
		throw error(401, 'Not found');
	}

	const { displayUtil } = await parent();

	const item = record['@graph']?.[1];

	return {
		title: item.hasTitle ? displayUtil.getItemLabel(item?.hasTitle?.[0]) : 'Titel här',
		tempJson: item
	};
}) satisfies PageLoad;
