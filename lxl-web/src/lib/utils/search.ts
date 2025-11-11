import { asArray, DisplayUtil, isObject, toLite, toString, VocabUtil } from '$lib/utils/xl';
import {
	Base,
	type DisplayDecorated,
	type FramedData,
	JsonLd,
	LensType,
	type Link,
	Owl
} from '$lib/types/xl';

import {
	type ApiItemDebugInfo,
	type DatatypeProperty,
	type DisplayMapping,
	type FacetGroup,
	type ItemDebugInfo,
	type MultiSelectFacet,
	type Observation,
	type PartialCollectionView,
	type SearchMapping,
	SearchOperators,
	type SearchResult,
	type SearchResultItem
} from '$lib/types/search';

import { getTranslator, type TranslateFn } from '$lib/i18n';
import { type LocaleCode as LangCode } from '$lib/i18n/locales';
import type { LibraryItem, UserSettings } from '$lib/types/userSettings';
import { LxlLens } from '$lib/types/display';
import { Width } from '$lib/types/auxd';
import { bestImage, bestSize, toSecure } from '$lib/utils/auxd';
import getAtPath from '$lib/utils/getAtPath';
import { getUriSlug } from '$lib/utils/http';
import { getHoldersCount, getHoldingsByInstanceId, getMyLibsFromHoldings } from './holdings';
import getTypeLike, { getTypeForIcon, type TypeLike } from '$lib/utils/getTypeLike';
import capitalize from '$lib/utils/capitalize';
import { ACCESS_FILTERS, MY_LIBRARIES_FILTER_ALIAS } from '$lib/constants/facets';

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
		'@id': view['@id'],
		...('next' in view && { next: replacePath(view.next as Link, usePath) }),
		...('previous' in view && { previous: replacePath(view.previous as Link, usePath) }),
		itemOffset: view.itemOffset,
		itemsPerPage: view.itemsPerPage,
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		mapping: displayMappings(view, displayUtil, locale, translate, usePath),
		first: replacePath(view.first, usePath),
		last: replacePath(view.last, usePath),
		items: asSearchResultItem(
			view.items,
			displayUtil,
			vocabUtil,
			locale,
			auxdSecret,
			myLibraries,
			maxScores
		),
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

export function asSearchResultItem(
	items: FramedData[],
	displayUtil: DisplayUtil,
	vocabUtil: VocabUtil,
	locale: LangCode,
	auxdSecret: string,
	myLibraries?: Record<string, LibraryItem>,
	maxScores?: Record<string, number>
): SearchResultItem[] {
	return items
		?.map((i) => cleanUpItem(i))
		.map((i) => ({
			...(myLibraries && {
				heldByMyLibraries: getHeldByMyLibraries(i, myLibraries, displayUtil, locale)
			}),
			...('_debug' in i && {
				_debug: asItemDebugInfo(i['_debug'] as ApiItemDebugInfo, maxScores)
			}),
			[JsonLd.ID]: i.meta[JsonLd.ID] as string,
			[JsonLd.TYPE]: i[JsonLd.TYPE] as string,
			[LxlLens.CardHeading]: displayUtil.lensAndFormat(i, LxlLens.CardHeading, locale),
			[LxlLens.CardBody]: displayUtil.lensAndFormat(i, LxlLens.CardBody, locale),
			[LensType.WebCardHeaderTop]: displayUtil.lensAndFormat(i, LensType.WebCardHeaderTop, locale),
			[LensType.WebCardHeaderExtra]: displayUtil.lensAndFormat(
				i,
				LensType.WebCardHeaderExtra,
				locale
			),
			[LensType.WebCardFooter]: displayUtil.lensAndFormat(i, LensType.WebCardFooter, locale),
			image: toSecure(bestSize(bestImage(i, locale), Width.SMALL), auxdSecret),
			typeStr: typeStr(getTypeLike(i, vocabUtil), displayUtil, locale),
			typeForIcon: getTypeForIcon(getTypeLike(i, vocabUtil)) || '', // FIXME
			selectTypeStr: selectTypeStr(getTypeLike(i, vocabUtil), displayUtil, locale), // FIXME
			numberOfHolders: getHoldersCount(i, vocabUtil)
		}));
}

function typeStr(typeLike: TypeLike, displayUtil: DisplayUtil, locale: LangCode): string {
	const noIdentify = typeLike.identify.length == 0;
	const noFind = typeLike.find.length == 0;
	const manyFind = typeLike.find.length > 1;
	const showFind = manyFind || (!noFind && noIdentify);
	const showNone = noFind && noIdentify && typeLike.none.length > 0;

	const t = {
		'@type': '_Types',
		...(showFind && { _find: typeLike.find }),
		...(!noIdentify && { _identify: typeLike.identify }),
		...(showNone && { _none: typeLike.none })
	};
	return toString(displayUtil.lensAndFormat(t, LensType.Card, locale));
}

function selectTypeStr(typeLike: TypeLike, displayUtil: DisplayUtil, locale: LangCode): string {
	const t = {
		'@type': '_Types',
		...(typeLike.select.length > 0 && { _select: typeLike.select })
	};
	return toString(displayUtil.lensAndFormat(t, LensType.Card, locale));
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
				const value = m[operator] as FramedData;

				let label = '';
				// FIXME
				if (Owl.PROPERTY_CHAIN_AXIOM in m.property && !(JsonLd.TYPE in m.property)) {
					label = label = m.alias
						? translate(`facet.${m.alias}`)
						: m.property[Owl.PROPERTY_CHAIN_AXIOM]
								.map((p) => toString(displayUtil.lensAndFormat(p, LensType.Token, locale)))
								.join('/');
				} else {
					label = m.alias
						? translate(`facet.${m.alias}`)
						: capitalize(m.property?.labelByLang?.[locale] || m.property?.label) ||
							m.property?.[JsonLd.ID] ||
							m._key;
				}

				return {
					...(isObject(m.property) && { [JsonLd.ID]: m.property[JsonLd.ID] }),
					display: displayUtil.lensAndFormat(value, LensType.Chip, locale),
					displayStr: toString(displayUtil.lensAndFormat(value, LensType.Chip, locale)) || '',
					label,
					operator,
					...(m.property?.[JsonLd.TYPE] === '_Invalid' && { invalid: m.property?.label }),
					...('up' in m && { up: replacePath(m.up as Link, usePath) }),
					...('variable' in m && { variable: m.variable }),
					_key: m._key,
					_value: m._value
				} as DisplayMapping;
			} else if (operator && operator in m) {
				const mappingArr = Array.isArray(m[operator]) ? m[operator] : [m[operator]];
				return {
					children: _iterateMapping(mappingArr as SearchMapping[]),
					operator,
					...('up' in m && { up: replacePath(m.up as Link, usePath) }),
					...('variable' in m && { variable: m.variable })
				} as DisplayMapping;
			} else if (m.object) {
				const defaultType = { [JsonLd.TYPE]: Base.Resource };
				return {
					display: displayUtil.lensAndFormat(
						{ ...defaultType, ...m.object },
						LensType.Chip,
						locale
					),
					displayStr:
						toString(
							displayUtil.lensAndFormat({ ...defaultType, ...m.object }, LensType.Chip, locale)
						) || translate(`filterAlias.${m.object?.alias}`), // Allow frontend-defined displayStr for custom filter aliases
					label: '',
					operator,
					...('up' in m && { up: replacePath(m.up as Link, usePath) }),
					...('variable' in m && { variable: m.variable }),
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

function cleanUpItem(item: FramedData): FramedData {
	if (isSerial(item)) {
		const FILTER_ROLES = [
			'https://id.kb.se/relator/publishingDirector',
			'https://id.kb.se/relator/responsibleParty',
			'https://id.kb.se/relator/editor',
			'https://id.kb.se/relator/honoree'
		];
		item.contribution = asArray(item.contribution).filter(
			(c) => !asArray(c.role).some((r) => FILTER_ROLES.includes(r[JsonLd.ID]))
		);
	}

	const HIDE_ROLES = [
		'https://id.kb.se/relator/author',
		'https://id.kb.se/relator/unspecifiedContributor'
	];
	asArray(item.contribution).forEach((c) => {
		if (asArray(c.role).every((r) => HIDE_ROLES.includes(r[JsonLd.ID]))) {
			delete c.role;
		}
	});

	return item;
}

function isSerial(item: FramedData): boolean {
	return (
		item[JsonLd.TYPE] === 'Serial' ||
		getAtPath(item, ['@reverse', 'instanceOf', '*', 'issuanceType']).every((v) => v === 'Serial')
	);
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
	// manually add myLibraries to boolfilters
	const boolFilters = addMyLibrariesBoolFilter(view.stats?._boolFilters, locale, translate) || [];

	const result = [];

	result.push(
		displayBoolFilters(
			'accessFilters',
			(f) => ACCESS_FILTERS.includes(<string>f.object?.alias),
			boolFilters,
			displayUtil,
			locale,
			translate,
			usePath
		)
	);

	result.push(...mapSlices(slices, displayUtil, locale, translate));

	result.push(
		displayBoolFilters(
			'boolFilters',
			(f) => !ACCESS_FILTERS.includes(<string>f.object?.alias),
			boolFilters,
			displayUtil,
			locale,
			translate,
			usePath
		)
	);

	return result;
}

function mapSlices(
	slices: Record<string, Slice>,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: TranslateFn,
	usePath?: string,
	parentDimension?: string
): FacetGroup[] {
	return Object.values(slices).map((g) => {
		const dimension = parentDimension ? `${parentDimension}/${g.dimension}` : g.dimension;
		return {
			label: translate(`facet.${g.alias || g.dimension}`),
			dimension: dimension,
			maxItems: g.maxItems,
			...('search' in g && { search: g.search }),
			facets: g.observation.map((o) => {
				const str = toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)) || '';
				return {
					...('_selected' in o && { selected: o._selected }),
					...('sliceByDimension' in o && {
						facetGroups: mapSlices(
							o.sliceByDimension,
							displayUtil,
							locale,
							translate,
							undefined,
							dimension + '/' + str
						)
					}),
					totalItems: o.totalItems,
					view: replacePath(o.view, usePath),
					object: toLite(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)),
					str: str,
					discriminator: getUriSlug(getAtPath(o.object, ['inScheme', JsonLd.ID], '')) || ''
				};
			})
		};
	});
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
	dimension: string,
	predicate: (o: Observation) => boolean,
	boolFilters: Observation[],
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: TranslateFn,
	usePath?: string
): FacetGroup {
	const filters = boolFilters?.filter(predicate) || [];

	const facets = filters.map((o) => {
		return {
			selected: o._selected || false,
			totalItems: o.totalItems,
			view: replacePath(o.view, usePath),
			object: toLite(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)),
			str: toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)) || '',
			discriminator: '',
			alias: o.object.alias
		};
	});

	return {
		label: translate(`facet.${dimension}`),
		dimension: dimension,
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

// TODO: we should get this from the backend...
function addMyLibrariesBoolFilter(
	boolFilters: Observation[] | undefined,
	locale: LangCode,
	translate: TranslateFn
) {
	if (boolFilters) {
		let existingBoolFilter: Observation | undefined;
		const rest: Observation[] = [];
		boolFilters.forEach((f) => {
			if (f.object.alias === MY_LIBRARIES_FILTER_ALIAS) {
				existingBoolFilter = f;
			} else rest.push(f);
		});

		if (existingBoolFilter) {
			// need to remove prefLabelByLang: {}, or lensAndFormat will use it (nothing) as label
			// and entire filter will be disregarded
			delete existingBoolFilter.object.prefLabelByLang;
			existingBoolFilter.object.prefLabel = translate(`facet.${MY_LIBRARIES_FILTER_ALIAS}`);
			return [...[existingBoolFilter], ...rest];
		} else {
			// not present, get a template object an modify it
			const newBoolFilter = structuredClone(rest[0]);
			delete newBoolFilter.object.prefLabelByLang;
			delete newBoolFilter.object.raw;
			newBoolFilter.object.prefLabel = translate(`facet.${MY_LIBRARIES_FILTER_ALIAS}`);
			newBoolFilter.view['@id'] = newBoolFilter.view['@id'].replace(
				newBoolFilter.object.alias as string,
				MY_LIBRARIES_FILTER_ALIAS
			);
			newBoolFilter.object.alias = MY_LIBRARIES_FILTER_ALIAS;
			newBoolFilter._selected = false;

			return [...[newBoolFilter], ...rest];
		}
	}
	return boolFilters;
}

/**
 * Conditionally append param specifying my libraries (from cookie)
 */
export function appendMyLibrariesParam(
	searchParams: URLSearchParams,
	userSettings: UserSettings
): URLSearchParams {
	if (['_q', '_r'].some((key) => searchParams.get(key)?.includes(MY_LIBRARIES_FILTER_ALIAS))) {
		let sigelStr;
		if (userSettings?.myLibraries) {
			sigelStr = Object.values(userSettings?.myLibraries)
				.map((lib) => `itemHeldBy:"sigel:${lib.sigel}"`)
				.join(' OR ');
		}
		searchParams.append(`_${MY_LIBRARIES_FILTER_ALIAS}`, sigelStr || '""');
	}
	return searchParams;
}
