import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import type { FramedData } from '../xl';
import { env } from '$env/dynamic/private';
import { JsonLd } from '../xl';

function getPrefix(id: string) {
	if (id.includes(env.API_URL)) {
		return 'libris:';
	}
	return Object.entries(PREFIXES_BY_NAMESPACE).find(([ns]) => id.includes(ns))?.[1];
}

function getQualifierValue(item: FramedData) {
	const prefix = getPrefix(item?.[JsonLd.ID] as string);
	const id = (item?.['@id'] as string).split('/').pop();

	if (prefix && id) {
		return '"' + prefix + encodeURIComponent(id) + '"';
	}
}

export default getQualifierValue;
