import { DisplayUtil, isObject, toString, VocabUtil } from '$lib/utils/xl';
import {
	type DisplayDecorated,
	type FramedData,
	type Link,
	LensType,
	JsonLd,
	Base
} from '$lib/types/xl';

import {
	type PartialCollectionView,
	type SearchResult,
	type DisplayMapping,
	type SearchMapping,
	SearchOperators,
	type DatatypeProperty,
	type MultiSelectFacet,
	type FacetGroup
} from '$lib/types/search';

import { LxlLens } from '$lib/types/display';
import { Width } from '$lib/types/auxd';
import { getTranslator, type translateFn } from '$lib/i18n';
import { type LocaleCode as LangCode } from '$lib/i18n/locales';
import { bestImage, bestSize, toSecure } from '$lib/utils/auxd';
import getAtPath from '$lib/utils/getAtPath';
import { getUriSlug } from '$lib/utils/http';
// import { error } from '@sveltejs/kit';
// import { env } from '$env/dynamic/public';

export async function asResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	vocabUtil: VocabUtil,
	locale: LangCode,
	auxdSecret: string,
	usePath: string
): Promise<SearchResult> {
	const translate = await getTranslator(locale);
	return {
		...('next' in view && { next: replacePath(view.next as Link, usePath) }),
		...('previous' in view && { previous: replacePath(view.previous as Link, usePath) }),
		itemOffset: view.itemOffset,
		itemsPerPage: view.itemsPerPage,
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		mapping: displayMappings(view, displayUtil, locale, translate, usePath),
		first: replacePath(view.first, usePath),
		last: replacePath(view.last, usePath),
		items: view.items.map((i) => ({
			[JsonLd.ID]: i.meta[JsonLd.ID] as string,
			[JsonLd.TYPE]: i[JsonLd.TYPE] as string,
			[LxlLens.CardHeading]: displayUtil.lensAndFormat(i, LxlLens.CardHeading, locale),
			[LxlLens.CardBody]: displayUtil.lensAndFormat(i, LxlLens.CardBody, locale),
			[LensType.WebCardHeaderExtra]: displayUtil.lensAndFormat(
				i,
				LensType.WebCardHeaderExtra,
				locale
			),
			[LensType.WebCardFooter]: displayUtil.lensAndFormat(i, LensType.WebCardFooter, locale),
			image: toSecure(bestSize(bestImage(i), Width.SMALL), auxdSecret),
			typeStr: toString(
				displayUtil.lensAndFormat(vocabUtil.getDefinition(i[JsonLd.TYPE]), LensType.Chip, locale)
			)
		})),
		facetGroups: displayFacetGroups(view, displayUtil, locale, translate, usePath),
		predicates: displayPredicates(view, displayUtil, locale, usePath),
		_spell: view._spell
			? view._spell.map((el) => {
					return {
						...el,
						...{ view: replacePath(el.view, usePath) }
					};
				})
			: []
	};
}

export function displayMappings(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	usePath?: string
): DisplayMapping[] {
	const mapping = view.search?.mapping || [];
	return _iterateMapping(mapping);

	function _iterateMapping(mapping: SearchMapping[]): DisplayMapping[] {
		return mapping.map((m: SearchMapping) => {
			const operator = _hasOperator(m);

			if ('property' in m && operator) {
				// Mock old behaviour for 'classic' search GUI, i.e show error page
				// when encountering an invalid property in order to provide feedback.
				// TODO remove this when Supersearch is fully implemented.
				// const useSuperSearch = env?.PUBLIC_USE_SUPERSEARCH === 'true';
				// if (!useSuperSearch && m.property?.['@type'] === '_Invalid') {
				// 	error(400, {
				// 		message: `Invalid query, please check the documentation. Unrecognized property alias: ${m.property?.label ?? ''}`
				// 	});
				// }

				const property = m[operator] as FramedData;
				return {
					...(isObject(m.property) && { '@id': m.property['@id'] }),
					display: displayUtil.lensAndFormat(property, LensType.Chip, locale),
					displayStr: toString(displayUtil.lensAndFormat(property, LensType.Chip, locale)) || '',
					label: m.alias
						? translate(`facet.${m.alias}`)
						: capitalize(m.property?.labelByLang?.[locale] || m.property?.label) ||
							m.property?.['@id'] ||
							'No label', // lensandformat?
					property:
						m.property?.librisQueryCode ||
						m.property?.['@id']?.replace('https://id.kb.se/vocab/', '') ||
						'', //TODO replace with something better
					operator,
					...(m.property?.['@type'] === '_Invalid' && { invalid: m.property?.label }),
					...('up' in m && { up: replacePath(m.up as Link, usePath) })
				} as DisplayMapping;
			} else if (operator && operator in m && Array.isArray(m[operator])) {
				const mappingArr = m[operator] as SearchMapping[];
				return {
					children: _iterateMapping(mappingArr),
					operator,
					...('up' in m && { up: replacePath(m.up as Link, usePath) })
				} as DisplayMapping;
			} else if (m.object) {
				const defaultType = { [JsonLd.TYPE]: Base.Resource };
				return {
					display: displayUtil.lensAndFormat(
						{ ...defaultType, ...m.object },
						LensType.Chip,
						locale
					),
					label: '',
					operator,
					...('up' in m && { up: replacePath(m.up as Link, usePath) })
				} as DisplayMapping;
			} else {
				return {
					display: { [JsonLd.VALUE]: '<ERROR>' } as DisplayDecorated,
					children: [],
					label: 'no label',
					operator
				} as DisplayMapping;
			}
		});
	}

	function _hasOperator(obj: SearchMapping): keyof typeof SearchOperators | undefined {
		const op = Object.values(SearchOperators).find((val) => val in obj) || SearchOperators.none;

		if (!isFreeTextQuery(obj.property)) {
			if (op === SearchOperators.equals && obj[op] === '*') {
				return SearchOperators.existence;
			}
			if (op === SearchOperators.notEquals && obj[op] === '*') {
				return SearchOperators.notExistence;
			}
		}

		return op;
	}
}

function isFreeTextQuery(property: unknown): boolean {
	return isDatatypeProperty(property) && property['@id'] === 'https://id.kb.se/vocab/textQuery';
}

function isDatatypeProperty(data: unknown): data is DatatypeProperty {
	return isObject(data) && data['@type'] === 'DatatypeProperty';
}

function displayFacetGroups(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	usePath: string
): FacetGroup[] {
	const slices = view.stats?.sliceByDimension || {};

	const result = Object.values(slices).map((g) => {
		return {
			label: translate(`facet.${g.alias || g.dimension}`),
			dimension: g.dimension,
			maxItems: g.maxItems,
			...('search' in g && { search: g.search }),
			facets: g.observation.map((o) => {
				return {
					...('_selected' in o && { selected: o._selected }),
					totalItems: o.totalItems,
					view: replacePath(o.view, usePath),
					object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale),
					str: toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)) || '',
					discriminator: getUriSlug(getAtPath(o.object, ['inScheme', JsonLd.ID], '')) || ''
				};
			})
		};
	});

	result.push(displayBoolFilters(view, displayUtil, locale, translate, usePath));

	return result;
}

export function displayPredicates(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	usePath: string
): MultiSelectFacet[] {
	const predicates = view.stats?._predicates || [];

	return predicates.map((o) => {
		return {
			...('_selected' in o && { selected: o._selected }),
			totalItems: o.totalItems,
			view: replacePath(o.view, usePath),
			object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale),
			str: toString(displayUtil.lensAndFormat(o.object, LensType.WebChip, locale)) || ''
		};
	});
}

function displayBoolFilters(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	usePath: string
): FacetGroup {
	const filters = view.stats?._boolFilters || [];

	const facets = filters.map((o) => {
		return {
			selected: o._selected || false,
			totalItems: o.totalItems,
			view: replacePath(o.view, usePath),
			object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale),
			str: toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)) || '',
			discriminator: ''
		};
	});

	return {
		label: translate('facet.boolFilters'),
		dimension: 'boolFilters',
		facets: facets
	};
}

/**
 * prevent links on resource page from pointing to /find
 */
function replacePath(view: Link, usePath: string | undefined) {
	if (usePath) {
		return {
			'@id': view['@id'].replace('/find', usePath)
		};
	}
	return view;
}

function capitalize(str: string | undefined) {
	if (str && typeof str === 'string') {
		return str[0].toUpperCase() + str.slice(1);
	}
	return str;
}

export function shouldShowMapping(mapping: DisplayMapping[]) {
	if (mapping.length === 1 && mapping[0].display === '*' && mapping[0].operator === 'equals') {
		return false; // hide if only wildcard search
	}
	return true;
}
