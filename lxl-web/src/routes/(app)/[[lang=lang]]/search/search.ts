import {
	type DisplayDecorated,
	DisplayUtil,
	type FramedData,
	isObject,
	JsonLd,
	type LangCode,
	LensType,
	type Link,
	type PropertyName
} from '$lib/utils/xl';

export function asResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode
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
		items: view.items.map((i) => displayUtil.lensAndFormat(i, LensType.Card, locale)),
		facetGroups: displayFacetGroups(view, displayUtil, locale)
	};
}

function displayFacetGroups(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode
): DisplayFacetGroup[] {
	const slices = view.stats?.sliceByDimension || {};

	return Object.values(slices).map((g) => {
		return {
			label: g.dimension, // TODO
			dimension: g.dimension,
			facets: g.observation.map((o) => {
				return {
					totalItems: o.totalItems,
					view: o.view,
					object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale)
				};
			})
		};
	});
}

function displayMappings(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode
): DisplayMapping[] {
	const mapping = view.search?.mapping || [];

	return mapping.map((m) => {
		if (isPredicateAndObject(m)) {
			return {
				...('up' in m && { up: m.up }),
				display: displayUtil.lensAndFormat(m.object, LensType.Chip, locale),
				children: []
			} as DisplayMapping;
		} else if (isPredicateAndValue(m)) {
			return {
				...('up' in m && { up: m.up }),
				display: { [JsonLd.VALUE]: m.value } as DisplayDecorated,
				children: []
			} as DisplayMapping;
		} else {
			return {
				display: { [JsonLd.VALUE]: '<ERROR>' } as DisplayDecorated,
				children: []
			} as DisplayMapping;
		}
	});
}

interface SearchResult {
	itemOffset: number;
	itemsPerPage: number;
	totalItems: number;
	maxItems: number;
	mapping: DisplayMapping[];
	first: Link;
	last: Link;
	next?: Link;
	items: DisplayDecorated[];
	facetGroups: DisplayFacetGroup[];
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
		mapping: (PredicateAndObject | PredicateAndValue)[];
	};
	first: Link;
	last: Link;
	next?: Link;
	items: FramedData[];
	stats?: {
		[JsonLd.ID]: '#stats';
		sliceByDimension: Record<FacetGroupId, FacetGroup>;
	};
}

type FacetGroupId = string;

interface FacetGroup {
	dimension: FacetGroupId;
	dimensionChain: PropertyName[];
	observation: Facet[];
}

interface Facet {
	totalItems: number;
	view: Link;
	object: FramedData;
}

interface DisplayFacetGroup {
	label: string;
	dimension: FacetGroupId;
	facets: DisplayFacet[];
}

interface DisplayFacet {
	totalItems: number;
	view: Link;
	object: DisplayDecorated;
}

interface DisplayMapping {
	display: DisplayDecorated;
	up?: Link;
	children: DisplayMapping[];
}

interface PredicateAndObject {
	variable: string;
	predicate: ObjectProperty | DatatypeProperty | PropertyChainAxiom;
	object: FramedData;
}
interface PredicateAndValue {
	variable: string;
	predicate: ObjectProperty | DatatypeProperty | PropertyChainAxiom;
	value: string;
}

interface ObjectProperty {}

interface DatatypeProperty {}

function isPredicateAndObject(v: unknown): v is PredicateAndObject {
	return isObject(v) && 'variable' in v && 'predicate' in v && 'object' in v;
}

function isPredicateAndValue(v: unknown): v is PredicateAndValue {
	return isObject(v) && 'variable' in v && 'predicate' in v && 'value' in v;
}

interface PropertyChainAxiom {
	propertyChainAxiom: (ObjectProperty | DatatypeProperty)[];
	label: string; // e.g. "instanceOf language"
	_key: string; // e.g. "instanceOf.language"
}
