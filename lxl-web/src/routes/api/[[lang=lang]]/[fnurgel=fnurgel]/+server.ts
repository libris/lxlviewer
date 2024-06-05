import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { DisplayUtil } from '$lib/utils/xl';
import { type FramedData, LensType } from '$lib/types/xl.types.js';
import { getSupportedLocale } from '$lib/i18n/locales';

export async function GET({ params, locals }) {
	const recordRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});
	const record = await recordRes.json();
	const mainEntity = record['mainEntity'] as FramedData;

	const displayUtil: DisplayUtil = locals.display;

	const decoratedRecord = displayUtil.format(
		displayUtil.applyLensOrdered(mainEntity, LensType.Card),
		getSupportedLocale(params?.lang)
	);

	return json(decoratedRecord, {
		headers: {
			'cache-control': 'public, max-age=300' // Probably best with an short max-age?
		}
	});
}
