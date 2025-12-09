import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { getSupportedLocale } from '$lib/i18n/locales';
import type { ApiError } from '$lib/types/api';
import type { HoldingMainEntity, HoldingsData } from '$lib/types/holdings.js';
import {
	getHoldingLibraries,
	getHoldingsByInstanceId,
	getBibIdsByInstanceId,
	getHoldingsByType,
	getHoldersByType
} from '$lib/utils/holdings.server';
import { centerOnWork } from '$lib/utils/centerOnWork';

export async function GET({ params, locals }) {
	const displayUtil = locals.display;
	const locale = getSupportedLocale(params.lang);
	const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});

	if (resourceRes.status === 404) {
		throw error(resourceRes.status, { message: 'Not found' });
	}

	if (!resourceRes.ok) {
		try {
			const err = (await resourceRes.json()) as ApiError;
			throw error(err.status_code, { message: err.message, status: err.status });
		} catch (e) {
			console.warn(e);
			throw error(resourceRes?.status, { message: resourceRes?.statusText });
		}
	}
	const resource = await resourceRes.json();
	const mainEntity = centerOnWork(resource['mainEntity']) as HoldingMainEntity;
	const holdingsByType = getHoldingsByType(mainEntity);
	const byType = getHoldersByType(holdingsByType);

	const holdings: HoldingsData = {
		byInstanceId: getHoldingsByInstanceId(mainEntity),
		byType,
		bibIdData: getBibIdsByInstanceId(mainEntity, displayUtil, resource, locale),
		holdingLibraries: getHoldingLibraries(byType)
	};

	return json(holdings, {
		headers: {
			'cache-control': 'public, max-age=1800' // 30 mins
		}
	});
}
