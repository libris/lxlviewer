import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, url }) => {
	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const recordsRes = await fetch(`${API_URL}/find.jsonld?${url.searchParams.toString()}`);
	const records = await recordsRes.json();

	const items = records.items.map((item) => ({
		'@id': item['@id']
	}));

	return {
		items
	};
};
