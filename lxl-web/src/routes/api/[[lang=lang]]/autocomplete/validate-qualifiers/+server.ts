import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { QualifiersResponse, ValidateQualifiersResponse } from '$lib/types/autocomplete';

export const GET: RequestHandler = async ({ url, params, fetch }) => {
	const q = url.searchParams.get('_q');

	if (!q) {
		return error(400, 'Missing _q param value');
	}

	const qualifiersRes = await fetch(
		`/api/autocomplete/${params.lang ? params.lang + '/' : ''}qualifiers`
	);
	const qualifiers: QualifiersResponse = await qualifiersRes.json();

	const qualifierMatches = [
		...q.matchAll(/(?<!\S+)((")?[0-9a-zA-ZaåöAÅÖ:]+\2):((")?[0-9a-zA-ZaåöAÅÖ:]+\4?)?/g)
	];

	const validatedQualifiers = qualifierMatches.length
		? qualifierMatches.map((regExpExecItem) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const [match, name, _, value] = regExpExecItem;

				return {
					match,
					name,
					value: value || null,
					range: { from: regExpExecItem.index, to: match.length + regExpExecItem.index },
					valid: qualifiers.some((validQualifier) => validQualifier.name === name)
				};
			})
		: null;

	return json(validatedQualifiers as ValidateQualifiersResponse);
};
