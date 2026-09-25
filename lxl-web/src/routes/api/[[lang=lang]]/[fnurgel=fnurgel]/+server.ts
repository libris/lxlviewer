import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl.server';
import { JsonLd, type FramedData } from '$lib/types/xl.js';
import type { ApiError } from '$lib/types/api';
import { getSupportedLocale } from '$lib/i18n/locales';
import { asSearchResultItem } from '$lib/utils/search.server';
import { centerOnWork } from '$lib/utils/centerOnWork.server.js';

export async function GET({ params, locals }) {
	const recordRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});

	if (!recordRes.ok) {
		let apiError: ApiError | undefined;
		if (recordRes.status !== 404) {
			try {
				apiError = (await recordRes.json()) as ApiError;
			} catch (e) {
				console.warn(e);
			}
		}
		return json(
			{
				message:
					apiError?.message || (recordRes.status === 404 ? 'Not found' : recordRes.statusText),
				...(apiError?.status && { status: apiError.status }),
				...(apiError?.error_id && { errorId: apiError.error_id })
			},
			{ status: apiError?.status_code || recordRes.status }
		);
	}

	const record = await recordRes.json();

	if (!record?.mainEntity) {
		return json({ message: 'Not found' }, { status: 404 });
	}

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
