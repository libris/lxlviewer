import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';

export const load = (async ({ url }) => {
	const _q = url.searchParams.get('_q');

	/* Ensure _q searchParam has an extra space if ending with a qualifier (to ensure qualifier isn't accidently edited when inserting new characters) */
	if (_q && QUALIFIER_REGEXP.test(_q.split(' ').pop() || '')) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('_q', _q + ' ');
		redirect(301, newUrl);
	}

	return {};
}) satisfies PageServerLoad;
