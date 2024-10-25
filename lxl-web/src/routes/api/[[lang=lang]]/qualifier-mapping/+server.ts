import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { languageTag } from '$lib/paraglide/runtime';
import jmespath from 'jmespath';
import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';
import PREFIXES_BY_NAMESPACE from '$lib/assets/json/prefixesByNamespace.json';
import { env } from '$env/dynamic/private';
import { type Qualifier } from '$lib/utils/supersearch/qualifiers';
import { JsonLd, toString } from '$lib/utils/xl';
import { globalDisplayUtil as displayUtil } from '../../../../hooks.server';
import { LxlLens } from '$lib/utils/display.types';

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
	const mappingsByPrefixedValue: { [key: string]: Qualifier } = qualifierMatches.reduce(
		(acc, currentMatch) => {
			const [, , , prefixedQualifierValue] = currentMatch;

			console.log('prefix', prefixedQualifierValue);

			if (!Object.keys(acc).includes(prefixedQualifierValue)) {
				const namespacedQualifierValue = getNamespacedValue(prefixedQualifierValue);

				if (namespacedQualifierValue) {
					const item = jmespath
						.search(searchMappings, `[].equals || [].*[][].equals`)
						.find((item) => item['@id'] === namespacedQualifierValue);
					if (item) {
						return {
							...acc,
							[prefixedQualifierValue]: {
								label: toString(displayUtil.lensAndFormat(item, LxlLens.PageHeading, lang)),
								resource: {
									[JsonLd.ID]: item[JsonLd.ID],
									[JsonLd.TYPE]: item[JsonLd.TYPE]
								}
							}
						};
					}
				}
			}
			return acc;
		},
		{}
	);

	console.log('mappings', mappingsByPrefixedValue);
	return json({
		mappingsByPrefixedValue
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
