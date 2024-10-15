import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { languageTag } from '$lib/paraglide/runtime';
import jmespath from 'jmespath';
import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';
import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import { env } from '$env/dynamic/private';
import { getQualifier, type Qualifier } from '$lib/utils/supersearch/qualifiers';

export const GET: RequestHandler = async ({ url, params, fetch }) => {
	const _q = url.searchParams.get('_q');
	const lang = params.lang || 'sv';

	if (!_q) {
		return json({});
	}

	const searchMappingsRes = await fetch(
		`/api/${languageTag()}/search-mapping?${new URLSearchParams({
			q: _q
		})}`
	);

	const { searchMappings } = await searchMappingsRes.json();

	const qualifierMatches = [
		..._q.matchAll(
			QUALIFIER_REGEXP // regex probalby needs modification
		)
	];

	/** TODO: the qualifier widgets should probably be able to parse the search mappings to ensure the search operators are working as intended */
	const qualifiersByPrefixedValue: { [key: string]: Qualifier } = qualifierMatches.reduce(
		(acc, currentMatch) => {
			const [, , , prefixedQualifierValue] = currentMatch;

			if (!Object.keys(acc).includes(prefixedQualifierValue)) {
				const namespacedQualifierValue = getNamespacedValue(prefixedQualifierValue);

				if (namespacedQualifierValue) {
					const item = jmespath
						.search(searchMappings, `[].equals || [].*[][].equals`)
						.find((item) => item['@id'] === namespacedQualifierValue);
					if (item) {
						return {
							...acc,
							[prefixedQualifierValue]: getQualifier({ item, lang })
						};
					}
				}
			}
			return acc;
		},
		{}
	);

	return json({
		qualifiersByPrefixedValue
	});
};

function getNamespacedValue(value: string) {
	const prefixRegExp = new RegExp(/(?<=^")[a-zA-ZaåöAÅÖ]+:/);
	const prefix = value.match(prefixRegExp)?.[0];
	const prefixNamespace =
		(prefix === 'libris:' && `${env.API_URL}/`) ||
		Object.entries(PREFIXES_BY_NAMESPACE).find(([, p]) => p === prefix)?.[0];
	if (prefixNamespace) {
		const namespacedValue = value
			.replace(prefixRegExp, prefixNamespace)
			.match(/(?<=^").+(?="$)/)?.[0]; // get value without quotes
		return namespacedValue;
	}
}
