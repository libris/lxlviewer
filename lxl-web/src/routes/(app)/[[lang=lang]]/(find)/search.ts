import {
	type DisplayDecorated,
	DisplayUtil,
	type FramedData,
	isObject,
	JsonLd,
	LensType,
	type Link,
	type PropertyName,
	toString
} from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';

import { type translateFn } from '$lib/i18n';
import { type LocaleCode as LangCode } from '$lib/i18n/locales';
import { calculateExpirationTime, generateAuxdImageUri, getFirstImageLink } from '$lib/utils/auxd';

export function asResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	auxdSecret: string,
	currentPath: string
): SearchResult {
	return {
		...('next' in view && { next: replacePath(view.next as Link, currentPath) }),
		itemOffset: view.itemOffset,
		itemsPerPage: view.itemsPerPage,
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		mapping: displayMappings(view, displayUtil, locale, translate, currentPath),
		first: replacePath(view.first, currentPath),
		last: replacePath(view.last, currentPath),
		items: view.items.map((i) => ({
			[JsonLd.ID]: i.meta[JsonLd.ID],
			[LxlLens.CardHeading]: displayUtil.lensAndFormat(i, LxlLens.CardHeading, locale),
			[LxlLens.CardBody]: displayUtil.lensAndFormat(i, LxlLens.CardBody, locale),
			imageUri: generateAuxdImageUri(calculateExpirationTime(), getFirstImageLink(i), auxdSecret)
		})),
		facetGroups: displayFacetGroups(view, displayUtil, locale, translate, currentPath)
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
	display: DisplayDecorated;
	up?: Link;
	children: DisplayMapping[];
	label: string;
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

function displayMappings(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	currentPath: string
): DisplayMapping[] {
	const mapping = view.search?.mapping || [];

	return mapping.map((m) => {
		const trimmedLabel = m.variable.replace(/and-|or-/, ''); // Hack?!
		const label = translate(`facet.${trimmedLabel}`);

		if (isPredicateAndObject(m)) {
			return {
				...('up' in m && { up: replacePath(m.up as Link, currentPath) }),
				display: displayUtil.lensAndFormat(m.object, LensType.Chip, locale),
				children: [],
				label
			} as DisplayMapping;
		} else if (isPredicateAndValue(m)) {
			return {
				...('up' in m && { up: m.up }),
				display: { [JsonLd.VALUE]: m.value } as DisplayDecorated,
				children: [],
				label
			} as DisplayMapping;
		} else {
			return {
				display: { [JsonLd.VALUE]: '<ERROR>' } as DisplayDecorated,
				children: [],
				label
			} as DisplayMapping;
		}
	});
}

function displayFacetGroups(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	currentPath: string
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
					view: replacePath(o.view, currentPath),
					object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale),
					str: toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale))
				};
			})
		};
	});
}

/**
 * prevent links on resource page from pointing to /find
 */
function replacePath(view: Link, currentPath: string) {
	return {
		'@id': view['@id'].replace('/find', currentPath)
	};
}

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
