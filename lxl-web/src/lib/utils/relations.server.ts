import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { VocabUtil } from '$lib/utils/xl.server';
import type { PartialCollectionView } from '$lib/types/search';
import { Base, JsonLd, Platform } from '$lib/types/xl';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
import capitalize from '$lib/utils/capitalize';
import { type ApiError } from '$lib/types/api.js';
import getAtPath from '$lib/utils/getAtPath';
import { getUriSlug } from '$lib/utils/http';

export async function getRelations(
	resourceId: string | null,
	vocabUtil: VocabUtil,
	locale: string,
	subsetFilter?: string | null,
	searchSite?: string | null
) {
	if (!resourceId) {
		return [];
	}

	const res = await fetch(
		`${env.API_URL}/find.jsonld?${new URLSearchParams({
			_o: resourceId,
			_q: '*',
			_limit: '0',
			_offset: '0',
			_sort: '',
			_spell: 'false',
			...(subsetFilter && { _r: subsetFilter }),
			...(searchSite && { _site: searchSite })
		}).toString()}`
	);

	if (!res.ok) {
		const err = (await res.json()) as ApiError;
		throw error(err.status_code, { message: err.message, status: err.status });
	}

	const data = (await res.json()) as PartialCollectionView;

	if (data.stats?._predicates) {
		return data.stats._predicates.map((p) => {
			const params = p.view[JsonLd.ID].split('?')[1];
			const q = new URLSearchParams(params).get('_q') as string;
			const predicateIri = p.predicate[JsonLd.ID] as string;
			const qualifierKey = getUriSlug(predicateIri);
			const label = capitalize(vocabUtil.getLabelByLang(predicateIri, locale) || qualifierKey);
			const preferLike: boolean = getAtPath(p.predicate, [Base.category, '*', JsonLd.ID])
				.map(getUriSlug)
				.some((c) => c === Platform.preferLike);
			const findUrl = `/find?${getSortedSearchParams(
				addDefaultSearchParams(
					new URLSearchParams({
						_q: q,
						_spell: 'false'
					})
				)
			).toString()}`;
			const previewUrl = `${env.API_URL}/find.jsonld?${getSortedSearchParams(
				addDefaultSearchParams(
					new URLSearchParams({
						_q: q,
						_limit: '10',
						_spell: 'false',
						_stats: 'falseThisRequest',
						...(subsetFilter && { _r: subsetFilter }),
						...(searchSite && { _site: searchSite })
					})
				)
			).toString()}`;

			return {
				qualifierKey,
				label,
				totalItems: p.totalItems,
				findUrl,
				previewUrl,
				isLike: preferLike
			};
		});
	}

	return [];
}
