import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales';
import type { ApiError } from '$lib/types/api';
import type { FramedData } from '$lib/types/xl';
import { LxlLens } from '$lib/types/display';
import { pickProperty, toString } from '$lib/utils/xl';
import {
	getBibIdsByInstanceId,
	getHoldersByType,
	getHoldingsByInstanceId,
	getHoldingsByType,
	getItemLinksByBibId
} from '$lib/utils/holdings';
import { error, json } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { centerOnWork } from '$lib/utils/centerOnWork';
import { holdersCache } from '$lib/utils/holdersCache.svelte';

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
	const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);
	const heading = displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale);

	const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);
	const instances = jmespath.search(overview, '*[].hasInstance[]');

	const holdingsByInstanceId = getHoldingsByInstanceId(mainEntity, displayUtil, locale);
	const bibIdsByInstanceId = getBibIdsByInstanceId(mainEntity, displayUtil, resource, locale);
	const itemLinksByBibId = getItemLinksByBibId(bibIdsByInstanceId, locale, displayUtil);

	// Should this be passed as a parameter to HoldingsModal.svelte instead?
	const holdingsByType = getHoldingsByType(mainEntity);
	const holdersByType = getHoldersByType(holdingsByType, displayUtil, locale);

	// FIXME: beware holdingsByInstanceId => has .heldBy.obj
	// holdingsByType => has just .heldBy without .obj
	const allHolders = Object.values(holdersByType).flat();
	const cachedHolders = holdersCache.holders;

	for (const h of allHolders) {
		const holdingsId = h.obj?.['@id'];

		if (holdingsId && h.sigel && cachedHolders && !cachedHolders[h.sigel]) {
			const response = await fetch(`${holdingsId}?framed=true`, {
				headers: { Accept: 'application/ld+json' }
			});
			if (response.ok) {
				const resJson = await response.json();
				const libraryMainEntity = resJson['mainEntity'] as FramedData;
				if (libraryMainEntity) {
					cachedHolders[h.sigel] = libraryMainEntity;
				}
			} else {
				console.error(`Could not fetch holder data for ${holdingsId}`);
			}
		}
	}

	//TODO: cache response for a short amount of time?
	return json({
		bibIdsByInstanceId: bibIdsByInstanceId,
		holdingsByInstanceId: holdingsByInstanceId,
		itemLinksByBibId: itemLinksByBibId,
		instances: instances,
		title: toString(heading),
		overview: overviewWithoutHasInstance,
		holdersByType: holdersByType
	});
}
