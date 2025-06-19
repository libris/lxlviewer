import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales';
import type { ApiError } from '$lib/types/api';
import type { FramedData } from '$lib/types/xl';
import { LxlLens } from '$lib/types/display';
import { pickProperty, toString } from '$lib/utils/xl';
import {
	fetchHoldersIfAbsent,
	getBibIdsByInstanceId,
	getHoldersByInstanceId,
	getHoldingsByInstanceId,
	getItemLinksByBibId
} from '$lib/utils/holdings';
import { error, json } from '@sveltejs/kit';
import jmespath from 'jmespath';

export async function GET({ url, params, locals }) {
	console.log('url', url);
	console.log('params', params);

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
	const holdersByInstanceId = getHoldersByInstanceId(holdingsByInstanceId, displayUtil, locale);

	//get all holders
	await fetchHoldersIfAbsent(Object.values(holdersByInstanceId).flat());
	console.log('bibIdsByInstanceId', bibIdsByInstanceId);

	return json({
		bibIdsByInstanceId: bibIdsByInstanceId,
		holdingsByInstanceId: holdingsByInstanceId,
		itemLinksByBibId: itemLinksByBibId,
		instances: instances,
		title: toString(heading),
		overview: overviewWithoutHasInstance
	});

	//TODO: duplicated, extract to holdings.ts? or similar
	function centerOnWork(mainEntity: FramedData): FramedData {
		if ('instanceOf' in mainEntity) {
			const result = mainEntity.instanceOf;
			delete mainEntity.instanceOf;
			result['@reverse'] = { instanceOf: [mainEntity] };
			if (!result.hasTitle && mainEntity.hasTitle) {
				result.hasTitle = mainEntity.hasTitle;
			}
			return result;
		} else {
			return mainEntity;
		}
	}
}
