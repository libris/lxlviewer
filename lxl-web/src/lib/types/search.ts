import { JsonLd, type Link, type DisplayDecorated, type FramedData } from '$lib/types/xl';
import { type SecureImageResolution } from '$lib/types/auxd';
import { LxlLens } from '$lib/types/display';

export interface SearchResult {
	itemOffset: number;
	itemsPerPage: number;
	totalItems: number;
	maxItems: number;
	mapping: DisplayMapping[];
	first: Link;
	last: Link;
	next?: Link;
	previous?: Link;
	items: SearchResultItem[];
	facetGroups: FacetGroup[];
	predicates: MultiSelectFacet[];
}

export interface SearchResultItem {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	[LxlLens.CardHeading]: DisplayDecorated;
	[LxlLens.CardBody]: DisplayDecorated;
	image: SecureImageResolution | undefined;
	typeStr: string;
}

type FacetGroupId = string;

export type FacetSearch = {
	mapping: {
		greaterThanOrEquals: string;
		lessThanOrEquals: string;
		variable: FacetGroupId;
	};
	template: string;
};

export interface FacetGroup {
	label: string;
	dimension: FacetGroupId;
	search?: FacetSearch;
	// TODO better to do this distinction on the group level?
	facets: (Facet | MultiSelectFacet)[];
}

export interface Facet {
	totalItems: number;
	view: Link;
	object: DisplayDecorated;
	str: string;
	discriminator: string;
}

export interface MultiSelectFacet extends Facet {
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
		_predicates: Observation[];
		_boolFilters?: Observation[];
	};
}

interface Slice {
	alias: string;
	dimension: FacetGroupId;
	observation: Observation[];
	search?: FacetSearch;
}

interface Observation {
	totalItems: number;
	view: Link;
	object: FramedData;
	_selected?: boolean;
}

export enum SearchOperators {
	and = 'and',
	or = 'or',
	not = 'not',
	equals = 'equals',
	notEquals = 'notEquals',
	greaterThan = 'greaterThan',
	greaterThanOrEquals = 'greaterThanOrEquals',
	lessThan = 'lessThan',
	lessThanOrEquals = 'lessThanOrEquals',
	existence = 'existence',
	notExistence = 'notExistence',
	none = 'none'
}

type MappingObj = { [key in SearchOperators]: SearchMapping[] | string | FramedData };

export interface SearchMapping extends MappingObj {
	alias: string;
	property?: ObjectProperty | DatatypeProperty | PropertyChainAxiom;
	object?: FramedData;
	up: { '@id': string };
}

interface ObjectProperty {}

export interface DatatypeProperty {
	'@type': 'DataTypeProperty';
	'@id': string;
}

interface PropertyChainAxiom {
	propertyChainAxiom: (ObjectProperty | DatatypeProperty)[];
	label: string; // e.g. "instanceOf language"
	_key: string; // e.g. "instanceOf.language"
}
