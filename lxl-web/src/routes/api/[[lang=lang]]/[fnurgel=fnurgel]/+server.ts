import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl';
import { JsonLd, type FramedData } from '$lib/types/xl.js';
import { getSupportedLocale } from '$lib/i18n/locales';
import { asSearchResultItem } from '$lib/utils/search';
import { centerOnWork } from '$lib/utils/centerOnWork.js';

export async function GET({ params, locals }) {
	const recordRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});
	const record = await recordRes.json();

	const mainEntity = centerOnWork(record['mainEntity'] as FramedData);
	mainEntity.meta = { [JsonLd.ID]: mainEntity[JsonLd.ID] };

	const displayUtil: DisplayUtil = locals.display;
	const vocabUtil: VocabUtil = locals.vocab;

	const searchCard = asSearchResultItem(
		[mainEntity],
		displayUtil,
		vocabUtil,
		getSupportedLocale(params?.lang),
		env.AUXD_SECRET,
		undefined,
		undefined
	)[0];

	return json(searchCard, {
		headers: {
			'cache-control': 'public, max-age=300' // Probably best with an short max-age?
		}
	});
}
