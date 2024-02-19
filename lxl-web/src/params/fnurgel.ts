import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param: string) => {
	return /^[a-z0-9]{15,}$/.test(param);
};
