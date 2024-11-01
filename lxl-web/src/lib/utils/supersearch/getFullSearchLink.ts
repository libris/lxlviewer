import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';

export function getFullSearchLink(_q: string): string {
	const sanatized = sanitizeQSearchParamValue(_q);
	if (sanatized) {
		const params = addDefaultSearchParams(
			new URLSearchParams({
				_q: sanatized + (QUALIFIER_REGEXP.test(sanatized.split(' ').pop() || '') ? ' ' : '') // add extra space at end if ending with qualifier without space after
			})
		).toString();
		return '/find?' + params;
	}
	return '';
}
