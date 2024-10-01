import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';

export function getTypeQualifierLink({
	initialQuery,
	change
}: {
	initialQuery: string;
	change: { from: number; to?: number; insert: string };
}) {
	return (
		'/find?' +
		addDefaultSearchParams(
			new URLSearchParams({
				_q:
					(initialQuery?.slice(0, change.to) || '') +
					change.insert +
					(initialQuery?.slice(change.to) || '')
			})
		).toString()
	);
}

export function getFullQualifierLink({
	initialQuery,
	change
}: {
	initialQuery: string;
	change: { from: number; to?: number; insert: string };
}) {
	return (
		'/find?' +
		addDefaultSearchParams(
			new URLSearchParams({
				_q:
					(initialQuery?.slice(0, change.from).trimEnd() || '') +
					change.insert +
					(initialQuery?.slice(change.to).trimStart() || '')
			})
		).toString()
	);
}
