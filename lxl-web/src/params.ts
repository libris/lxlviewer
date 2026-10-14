import { defineParams } from '@sveltejs/kit/params';
import isFnurgel from '#lib/utils/isFnurgel.js';

const matchFnurgel = (param: string) => {
	return isFnurgel(param);
};

const matchLang = (param: string) => {
	return /^[a-z]{2}$/.test(param);
};

const matchResource = (param: string) => {
	/*
	Without this SSR rendering of /find fails because the API call to /find.jsonld
	somehow gets routed so that /find is called which returns HTML to getFacets() which blows up.
	Not reproducible locally, only in dev/qa/stg/prod env.
	 */
	return !param.endsWith('.jsonld');
};

export const params = defineParams({
	fnurgel: (param) => (matchFnurgel(param) ? param : undefined),
	lang: (param) => (matchLang(param) ? param : undefined),
	resource: (param) => (matchResource(param) ? param : undefined)
});
