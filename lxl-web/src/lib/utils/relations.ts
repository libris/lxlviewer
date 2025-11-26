import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { VocabUtil } from '$lib/utils/xl';
import type { PartialCollectionView } from '$lib/types/search';
import { JsonLd } from '$lib/types/xl';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
import prefixesByNamespace from '$lib/assets/json/prefixesByNamespace.json';
import capitalize from '$lib/utils/capitalize';
import { type ApiError } from '$lib/types/api.js';

export type Relation = {
	qualifierKey: string;
	label: string;
	totalItems: number;
	findUrl: string;
	previewUrl: string;
};

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
			const qualifierKey = new URLSearchParams(p.view[JsonLd.ID]).get('_p') as string;
			const qualifierValue = getQualifierValue(resourceId);
			const label = capitalize(
				vocabUtil.getLabelByLang(qualifierKey as string, locale) || qualifierKey
			);
			const findUrl = `/find?${getSortedSearchParams(
				addDefaultSearchParams(
					new URLSearchParams({
						_q: `${qualifierKey}:${qualifierValue}`,
						_spell: 'false'
					})
				)
			).toString()}`;
			const previewUrl = `${env.API_URL}/find.jsonld?${getSortedSearchParams(
				addDefaultSearchParams(
					new URLSearchParams({
						_q: `${qualifierKey}:${qualifierValue}`,
						_limit: '10',
						_spell: 'false',
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
				previewUrl
			};
		});
	}

	return [];
}

function getQualifierValue(id: string) {
	const prefix = getPrefix(id);
	const qId = id.split('/').pop();

	if (prefix && qId) {
		return '"' + prefix + qId + '"';
	}
	if (looksLikeUri(id)) {
		return '"' + id + '"';
	}
	return id;
}

function looksLikeUri(id: string) {
	return id.startsWith('https://') || id.startsWith('http://');
}

function getPrefix(id: string) {
	const prefixFromNamespace = Object.entries(prefixesByNamespace).find(([ns]) =>
		id.includes(ns)
	)?.[1];

	if (prefixFromNamespace) {
		return prefixFromNamespace;
	}
	if (id.includes(env.API_URL)) {
		return 'libris:';
	}
	return '';
}
