function addWrappingSpaces({
	query,
	insert,
	editedRange
}: {
	query: string;
	insert: string;
	editedRange: {
		from: number;
		to: number;
	};
}) {
	const before = query.slice(0, editedRange.from)?.trimEnd();
	const after = query.slice(editedRange.to)?.trimStart();

	return (before ? ' ' : '') + insert + (after ? ' ' : '');
}

export default addWrappingSpaces;
