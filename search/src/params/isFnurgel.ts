import type { ParamMatcher } from '@sveltejs/kit';
import { getNumberOfVowels } from 'lxljs/string';

export const match: ParamMatcher = (param) => {
	return getNumberOfVowels(param) == 0 && param.length > 14;
};
