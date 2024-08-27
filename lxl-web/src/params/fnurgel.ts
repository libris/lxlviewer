import type { ParamMatcher } from '@sveltejs/kit';
import isFnurgel from '$lib/utils/isFnurgel';

export const match: ParamMatcher = (param: string) => {
	return isFnurgel(param);
};
