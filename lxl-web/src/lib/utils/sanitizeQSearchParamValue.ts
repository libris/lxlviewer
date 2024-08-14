/**
 * Sanitizes _q search param value by removing unnecessary whitespaces and line-breaks
 */

function sanitizeQSearchParamValue(q: string | null): string {
	return (
		q
			?.trim()
			.replace(/(\r\n|\n|\r)/gm, ' ') // replace line breaks with spaces
			.replace(/\s+/g, ' ') || '' // replace multiple whitespaces with one space
	);
}

export default sanitizeQSearchParamValue;
