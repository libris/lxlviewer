import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';

function getQualifierLink({
	initialQuery,
	editedRange,
	qualifierType,
	qualifierValue,
	appendEditedRange = false
}: {
	initialQuery: string;
	editedRange: {
		from: number;
		to: number;
	} | null;
	qualifierType?: string;
	qualifierValue?: string;
	appendEditedRange?: boolean;
}) {
	if (!editedRange || !qualifierType) {
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
				_q:
					(before ? `${before} ` : '') +
					`${qualifierType}:${qualifierValue || ''}` +
					(after ? ` ${after}` : '')
			})
		)
	);
}

export default getQualifierLink;
