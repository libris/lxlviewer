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
	type FacetGroup,
	type ApiItemDebugInfo,
	type ItemDebugInfo
} from '$lib/types/search';

import { getTranslator, type TranslateFn } from '$lib/i18n';
import { type LocaleCode as LangCode } from '$lib/i18n/locales';
import type { LibraryItem } from '$lib/types/userSettings';
import { LxlLens } from '$lib/types/display';
import { Width } from '$lib/types/auxd';
import { bestImage, bestSize, toSecure } from '$lib/utils/auxd';
import getAtPath from '$lib/utils/getAtPath';
import { getUriSlug } from '$lib/utils/http';
import { getHoldingsByInstanceId, getMyLibsFromHoldings } from './holdings';

export async function asResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	vocabUtil: VocabUtil,
	locale: LangCode,
	auxdSecret: string,
	usePath?: string,
	myLibraries?: Record<string, LibraryItem>
): Promise<SearchResult> {
	const translate = await getTranslator(locale);

	const hasDebug = view.items?.length > 0 && view.items?.[0]._debug;
	const maxScores = hasDebug
		? getMaxScores(view.items.map((i) => i._debug as ApiItemDebugInfo))
		: {};

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
		items: view.items?.map((i) => ({
			...(myLibraries && {
				heldByMyLibraries: getHeldByMyLibraries(i, myLibraries, displayUtil, locale)
			}),
			...('_debug' in i && { _debug: asItemDebugInfo(i['_debug'] as ApiItemDebugInfo, maxScores) }),
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
			image: toSecure(bestSize(bestImage(i, locale), Width.SMALL), auxdSecret),
			typeStr: toString(
				displayUtil.lensAndFormat(vocabUtil.getDefinition(i[JsonLd.TYPE]), LensType.Chip, locale)
			)
		})),
		...('stats' in view && {
			facetGroups: displayFacetGroups(view, displayUtil, locale, translate, usePath)
		}),
		...('stats' in view && { predicates: displayPredicates(view, displayUtil, locale, usePath) }),
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
	translate: TranslateFn,
	usePath?: string
): DisplayMapping[] {
	const mapping = view.search?.mapping || [];
	return _iterateMapping(mapping);

	function _iterateMapping(mapping: SearchMapping[]): DisplayMapping[] {
		return mapping.map((m: SearchMapping) => {
			const operator = _hasOperator(m);

			if ('property' in m && operator) {
				const property = m[operator] as FramedData;
				return {
					...(isObject(m.property) && { [JsonLd.ID]: m.property[JsonLd.ID] }),
					display: displayUtil.lensAndFormat(property, LensType.Chip, locale),
					displayStr: toString(displayUtil.lensAndFormat(property, LensType.Chip, locale)) || '',
					label: m.alias
						? translate(`facet.${m.alias}`)
						: capitalize(m.property?.labelByLang?.[locale] || m.property?.label) ||
							m.property?.[JsonLd.ID] ||
							'No label', // lensandformat?
					operator,
					...(m.property?.[JsonLd.TYPE] === '_Invalid' && { invalid: m.property?.label }),
					...('up' in m && { up: replacePath(m.up as Link, usePath) }),
					_key: m._key,
					_value: m._value
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
					displayStr: toString(
						displayUtil.lensAndFormat({ ...defaultType, ...m.object }, LensType.Chip, locale)
					),
					label: '',
					operator,
					...('up' in m && { up: replacePath(m.up as Link, usePath) }),
					_value: m?.value
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

function getMaxScores(itemDebugs: ApiItemDebugInfo[]) {
	const scores = itemDebugs.map((i) => {
		return {
			...i._score._perField,
			_total: i._score._total
		};
	}) as Record<string, number>[];

	return scores.reduce((result, current) => {
		for (const key of Object.keys(current)) {
			result[key] = Math.max(result[key] || 0, current[key]);
		}
		return result;
	}, {});
}

function asItemDebugInfo(i: ApiItemDebugInfo, maxScores: Record<string, number>): ItemDebugInfo {
	const matchedFields = i._score._matchedFields || {};
	return {
		score: {
			total: i._score._total,
			totalPercent: i._score._total / maxScores._total,
			perField: Object.entries(i._score._perField).map(([k, v]) => {
				const fs = k.split(':');
				const name = fs.slice(0, -1).join(':');
				return {
					name: name,
					needle: fs.at(-1) || '',
					score: v,
					scorePercent: v / maxScores[k],
					haystack: (matchedFields[name] || []).toSorted()
				};
			}),
			explain: i._score._explain
		}
	};
}

function getHeldByMyLibraries(
	item: FramedData,
	myLibraries: Record<string, LibraryItem>,
	display: DisplayUtil,
	locale: LangCode
) {
	const res = getHoldingsByInstanceId(item, display, locale);
	return getMyLibsFromHoldings(myLibraries, res);
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
	translate: TranslateFn,
	usePath?: string
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
	usePath?: string
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
	translate: TranslateFn,
	usePath?: string
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
