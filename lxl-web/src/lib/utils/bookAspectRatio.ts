export function bookAspectRatio(iconTypeStr: string[]) {
	return Array.isArray(iconTypeStr) && iconTypeStr.some((t) => BOOKTYPE.includes(t));
}

const BOOKTYPE = [
	'_book',
	'_book_braille',
	'Literature',
	'Ej%20sk%C3%B6nlitteratur',
	'Facklitteratur',
	'Sk%C3%B6nlitteratur',
	'Barn-%20och%20ungdomslitteratur',
	'Text',
	'Seriella%20publikationer',
	'Periodika',
	'NotatedMusic'
];
