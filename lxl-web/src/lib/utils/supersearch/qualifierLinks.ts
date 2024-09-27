import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
import { type QualifierEvent } from '$lib/components/SuggestionListItem.svelte';

export function getTypeQualifierLink({ initialQuery, change }: QualifierEvent) {
	return (
		'/find?' +
		addDefaultSearchParams(
			new URLSearchParams({
				_q:
					(initialQuery.slice(0, change.to) || '') +
					change.insert +
					(initialQuery?.slice(change.to) || '')
			})
		).toString()
	);
}

export function getFullQualifierLink({ initialQuery, change }: QualifierEvent) {
	return (
		'/find?' +
		addDefaultSearchParams(
			new URLSearchParams({
				_q:
					(initialQuery.slice(0, change.from).trimEnd() || '') +
					change.insert +
					(initialQuery?.slice(change.to).trimStart() || '')
			})
		).toString()
	);
}
