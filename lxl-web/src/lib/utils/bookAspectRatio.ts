export function bookAspectRatio(iconTypeStr: string) {
	return (
		iconTypeStr &&
		[
			'Literature',
			'Ej%20sk%C3%B6nlitteratur',
			'Facklitteratur',
			'Sk%C3%B6nlitteratur',
			'Barn-%20och%20ungdomslitteratur',
			'Text',
			'Seriella%20publikationer',
			'Periodika',
			'NotatedMusic'
		].includes(iconTypeStr)
	);
}
