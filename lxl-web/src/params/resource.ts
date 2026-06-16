import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param: string) => {
	/*
	Without this SSR rendering of /find fails because the API call to /find.jsonld
	somehow gets routed so that /find is called which returns HTML to getFacets() which blows up.
	Not reproducible locally, only in dev/qa/stg/prod env.
	 */
	return !param.endsWith('.jsonld');
};
