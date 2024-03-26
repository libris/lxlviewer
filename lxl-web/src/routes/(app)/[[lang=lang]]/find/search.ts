import {
	type DisplayDecorated,
	DisplayUtil,
	type FramedData,
	JsonLd,
	LensType,
	type Link,
	type PropertyName,
	toString
} from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';

import { type translateFn } from '$lib/i18n';
import { type LocaleCode as LangCode } from '$lib/i18n/locales';

export function asResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn
): SearchResult {
	return {
		...('next' in view && { next: view.next }),
		itemOffset: view.itemOffset,
		itemsPerPage: view.itemsPerPage,
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		mapping: displayMappings(view, displayUtil, locale),
		first: view.first,
		last: view.last,
		items: view.items.map((i) => ({
			[JsonLd.ID]: i.meta[JsonLd.ID],
			[LxlLens.CardHeading]: displayUtil.lensAndFormat(i, LxlLens.CardHeading, locale),
			[LxlLens.CardBody]: displayUtil.lensAndFormat(i, LxlLens.CardBody, locale)
		})),
		facetGroups: displayFacetGroups(view, displayUtil, locale, translate)
	};
}

export interface SearchResult {
	itemOffset: number;
	itemsPerPage: number;
	totalItems: number;
	maxItems: number;
	mapping: DisplayMapping[];
	first: Link;
	last: Link;
	next?: Link;
	items: DisplayDecorated[];
	facetGroups: FacetGroup[];
}

type FacetGroupId = string;

export interface FacetGroup {
	label: string;
	dimension: FacetGroupId;
	// TODO better to do this distinction on the group level?
	facets: (Facet | MultiSelectFacet)[];
}

interface Facet {
	totalItems: number;
	view: Link;
	object: DisplayDecorated;
	str: string;
}

interface MultiSelectFacet extends Facet {
	selected: boolean;
}

export interface DisplayMapping {
	display?: DisplayDecorated;
	up?: Link;
	children?: DisplayMapping[];
	label?: string;
	operator: keyof typeof SearchOperators;
}

export interface PartialCollectionView {
	[JsonLd.TYPE]: 'PartialCollectionView';
	[JsonLd.ID]: string;
	[JsonLd.CONTEXT]: string;
	itemOffset: number;
	itemsPerPage: number;
	totalItems: number;
	maxItems: number;
	search: {
		mapping: SearchMapping[];
	};
	first: Link;
	last: Link;
	next?: Link;
	items: FramedData[];
	stats?: {
		[JsonLd.ID]: '#stats';
		sliceByDimension: Record<FacetGroupId, Slice>;
	};
}

interface Slice {
	dimension: FacetGroupId;
	dimensionChain: PropertyName[];
	observation: Observation[];
}

interface Observation {
	totalItems: number;
	view: Link;
	object: FramedData;
	_selected?: boolean;
}

enum SearchOperators {
	and = 'and',
	or = 'or',
	not = 'not',
	equals = 'equals',
	notEquals = 'notEquals',
	greaterThan = 'greaterThan',
	greaterThanOrEquals = 'greaterThanOrEquals',
	lessThan = 'lessThan',
	lessThanOrEquals = 'lessThanOrEquals'
}

type MappingObj = { [key in SearchOperators]: SearchMapping[] | string | FramedData };

interface SearchMapping extends MappingObj {
	property?: ObjectProperty | DatatypeProperty | PropertyChainAxiom;
	up: { '@id': string };
}

interface ObjectProperty {}

interface DatatypeProperty {}

function displayMappings(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode
): DisplayMapping[] {
	const mapping = view.search?.mapping || [];
	return _iterateMapping(mapping);

	function _iterateMapping(mapping: SearchMapping[]): DisplayMapping[] {
		return mapping.map((m: SearchMapping) => {
			const operator = _hasOperator(m);

			if ('property' in m && operator) {
				const property = m[operator] as FramedData;
				return {
					display: displayUtil.lensAndFormat(property, LensType.Chip, locale),
					label: m.property?.labelByLang?.[locale] || 'no label', // lensandformat?
					operator,
					...('up' in m && { up: m.up })
				} as DisplayMapping;
			} else if (operator && operator in m && Array.isArray(m[operator])) {
				const mappingArr = m[operator] as SearchMapping[];
				return {
					children: _iterateMapping(mappingArr),
					operator,
					...('up' in m && { up: m.up })
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
		return Object.values(SearchOperators).find((val) => val in obj);
	}
}

function displayFacetGroups(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn
): FacetGroup[] {
	const slices = view.stats?.sliceByDimension || {};

	return Object.values(slices).map((g) => {
		return {
			label: translate(`facet.${g.dimension}`),
			dimension: g.dimension,
			facets: g.observation.map((o) => {
				return {
					...('_selected' in o && { selected: o._selected }),
					totalItems: o.totalItems,
					view: o.view,
					object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale),
					str: toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale))
				};
			})
		};
	});
}

interface PropertyChainAxiom {
	propertyChainAxiom: (ObjectProperty | DatatypeProperty)[];
	label: string; // e.g. "instanceOf language"
	_key: string; // e.g. "instanceOf.language"
}
