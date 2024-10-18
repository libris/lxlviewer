import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';
import { languageTag } from '$lib/paraglide/runtime';
import { env } from '$env/dynamic/private';
import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
import { globalDisplayUtil as displayUtil } from '../../../../hooks.server';
import { LxlLens } from '$lib/utils/display.types';

export const load = (async ({ url, fetch }) => {
	const _q = url.searchParams.get('_q');

	/* Ensure _q searchParam has an extra space if ending with a qualifier (to ensure qualifier isn't accidently edited when inserting new characters) */
	if (_q && QUALIFIER_REGEXP.test(_q.split(' ').pop() || '')) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('_q', _q + ' ');
		redirect(301, newUrl);
	}

	if (_q) {
		const qualifierRes = await fetch(
			`/api/${languageTag()}/qualifier?${new URLSearchParams({
				_q
			})}`
		);

		const qualifiers = await qualifierRes.json();

		const findResSearchParams = new URLSearchParams([
			['_q', sanitizeQSearchParamValue(_q).trim()],
			['_i', ''],
			['_limit', '10'],
			['_offset', '0'],
			['_sort', '']
		]);

		const recordsRes = await fetch(`${env.API_URL}/find?${findResSearchParams.toString()}`);
		const records = await recordsRes.json();

		const items = records.items.map((item) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { ['@reverse']: reverse, ...restItem } = item;
			const heading = displayUtil.lensAndFormat(restItem, LxlLens.CardHeading, languageTag());
			const body = displayUtil.lensAndFormat(restItem, LxlLens.CardBody, languageTag());

			return {
				heading,
				body
			};
		});

		return { qualifiers, records: items };
	}
}) satisfies PageServerLoad;
