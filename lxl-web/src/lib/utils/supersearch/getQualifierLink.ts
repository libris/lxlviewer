import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';

function getQualifierLink({
	initialQuery,
	editedRange,
	insert,
	appendEditedRange = false
}: {
	initialQuery: string;
	editedRange: {
		from: number;
		to: number;
	} | null;
	insert?: string;
	appendEditedRange?: boolean;
}) {
	if (!editedRange || !insert) {
		return null;
	}
	const before = initialQuery
		.slice(0, appendEditedRange ? editedRange.to : editedRange.from)
		?.trimEnd();
	const after = initialQuery.slice(editedRange.to)?.trimStart();

	return (
		'/find?' +
		addDefaultSearchParams(
			new URLSearchParams({
				_q: (before ? `${before} ` : '') + insert + (after ? ` ${after}` : '')
			})
		)
	);
}

export default getQualifierLink;
