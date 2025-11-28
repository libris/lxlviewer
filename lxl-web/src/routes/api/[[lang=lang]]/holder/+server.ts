import { error, json } from '@sveltejs/kit';
import { getLibrary } from '$lib/utils/getLibraries.server';

// unused atm - remove?
export async function GET({ url }) {
	const id = url.searchParams.get('id');

	if (id) {
		const library = getLibrary(id);
		if (library) {
			return json(library, {
				headers: {
					'cache-control': 'public, max-age=86400' // 24 hrs??
				}
			});
		} else {
			console.error(`Could not fetch holder data for ${id}`);
			return error(404, 'not found');
		}
	}
}
