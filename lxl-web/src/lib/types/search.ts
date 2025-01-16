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
	_spell: SpellingSuggestion[] | [];
}

export interface SearchResultItem {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	[LxlLens.CardHeading]: DisplayDecorated;
	[LxlLens.CardBody]: DisplayDecorated;
	image: SecureImageResolution | undefined;
	typeStr: string;
	_debug?: SearchResultItemDebug;
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
	maxItems?: number;
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

interface SpellingSuggestion {
	label: string;
	labelHtml: string;
	view: Link;
}

export interface DisplayMapping {
	'@id'?: string;
	display?: DisplayDecorated;
	displayStr?: string;
	up?: Link;
	children?: DisplayMapping[];
	label?: string;
	operator: keyof typeof SearchOperators;
	property?: string;
	invalid?: string;
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
	_spell: SpellingSuggestion[] | [];
}

interface Slice {
	alias: string;
	dimension: FacetGroupId;
	observation: Observation[];
	search?: FacetSearch;
	maxItems: number;
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
	property?: ObjectProperty | DatatypeProperty | PropertyChainAxiom | InvalidProperty;
	object?: FramedData;
	up: { '@id': string };
}

interface ObjectProperty {
	'@id'?: string;
}

export interface DatatypeProperty {
	'@type': 'DataTypeProperty';
	'@id': string;
}

interface InvalidProperty {
	'@type': '_Invalid';
	label: string;
}

interface PropertyChainAxiom {
	propertyChainAxiom: (ObjectProperty | DatatypeProperty)[];
	label: string; // e.g. "instanceOf language"
	_key: string; // e.g. "instanceOf.language"
}

export interface ItemDebug {
	_score: {
		_total: number;
		_perField: Record<string, number>;
		_explain: EsExplain;
	};
}

export interface SearchResultItemDebug {
	score: {
		total: number;
		totalPercent: number;
		perField: {
			name: string;
			searchString: string;
			score: number;
			scorePercent: number;
		}[];
		explain: EsExplain;
	};
}

export interface EsExplain {
	description: string;
	value: number;
	details: EsExplain[];
}
