import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl';
import { JsonLd, type FramedData } from '$lib/types/xl.js';
import { getSupportedLocale } from '$lib/i18n/locales';
import { asSearchResultItem } from '$lib/utils/search';
import { centerOnWork } from '$lib/utils/centerOnWork.js';

export async function GET({ params, locals, url }) {
	const _recUrl = `${env.API_URL}/${params.fnurgel}?framed=true`;
	const _recHeaders = { Accept: 'application/ld+json' };
	console.log('[DEBUG fetch api/fnurgel record]', {
		outerUrl: url.toString(),
		fetchUrl: _recUrl,
		headers: _recHeaders
	});
	const recordRes = await fetch(_recUrl, { headers: _recHeaders });
	console.log('[DEBUG fetch api/fnurgel record <-]', {
		fetchUrl: _recUrl,
		status: recordRes.status,
		contentType: recordRes.headers.get('content-type')
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
		env.AUXD_SECRET
	)[0];

	return json(searchCard, {
		headers: {
			'cache-control': 'public, max-age=300' // Probably best with an short max-age?
		}
	});
}
