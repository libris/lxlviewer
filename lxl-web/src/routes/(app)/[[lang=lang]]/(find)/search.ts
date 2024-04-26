import {
	type DisplayDecorated,
	DisplayUtil,
	type FramedData,
	isObject,
	JsonLd,
	LensType,
	type Link,
	toString
} from '$lib/utils/xl';
import { LxlLens } from '$lib/utils/display.types';
import { type translateFn, getTranslator } from '$lib/i18n';
import { type LocaleCode as LangCode } from '$lib/i18n/locales';
import { calculateExpirationTime, generateAuxdImageUri, getFirstImageLink } from '$lib/utils/auxd';

export async function asResult(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	auxdSecret: string,
	usePath: string
): Promise<SearchResult> {
	const translate = await getTranslator(locale);
	return {
		...('next' in view && { next: replacePath(view.next as Link, usePath) }),
		itemOffset: view.itemOffset,
		itemsPerPage: view.itemsPerPage,
		totalItems: view.totalItems,
		maxItems: view.maxItems,
		mapping: displayMappings(view, displayUtil, locale, translate, usePath),
		first: replacePath(view.first, usePath),
		last: replacePath(view.last, usePath),
		items: view.items.map((i) => ({
			[JsonLd.ID]: i.meta[JsonLd.ID],
			[JsonLd.TYPE]: i[JsonLd.TYPE],
			[LxlLens.CardHeading]: displayUtil.lensAndFormat(i, LxlLens.CardHeading, locale),
			[LxlLens.CardBody]: displayUtil.lensAndFormat(i, LxlLens.CardBody, locale),
			imageUri: generateAuxdImageUri(calculateExpirationTime(), getFirstImageLink(i), auxdSecret)
		})),
		facetGroups: displayFacetGroups(view, displayUtil, locale, translate, usePath)
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
	alias: string;
	dimension: FacetGroupId;
	observation: Observation[];
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
	notExistence = 'notExistence'
}

type MappingObj = { [key in SearchOperators]: SearchMapping[] | string | FramedData };

interface SearchMapping extends MappingObj {
	alias: string;
	property?: ObjectProperty | DatatypeProperty | PropertyChainAxiom;
	up: { '@id': string };
}

interface ObjectProperty {}

interface DatatypeProperty {
	'@type': 'DataTypeProperty';
	'@id': string;
}

function displayMappings(
	view: PartialCollectionView,
	displayUtil: DisplayUtil,
	locale: LangCode,
	translate: translateFn,
	usePath: string
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
					label: m.alias
						? translate(`facet.${m.alias}`)
						: m.property?.labelByLang?.[locale] || m.property?.['@id'] || 'no label', // lensandformat?
					operator,
					...('up' in m && { up: replacePath(m.up as Link, usePath) })
				} as DisplayMapping;
			} else if (operator && operator in m && Array.isArray(m[operator])) {
				const mappingArr = m[operator] as SearchMapping[];
				return {
					children: _iterateMapping(mappingArr),
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
		const op = Object.values(SearchOperators).find((val) => val in obj);

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

	return Object.values(slices).map((g) => {
		return {
			label: translate(`facet.${g.alias || g.dimension}`),
			dimension: g.dimension,
			facets: g.observation.map((o) => {
				return {
					...('_selected' in o && { selected: o._selected }),
					totalItems: o.totalItems,
					view: replacePath(o.view, usePath),
					object: displayUtil.lensAndFormat(o.object, LensType.Chip, locale),
					str: toString(displayUtil.lensAndFormat(o.object, LensType.Chip, locale)) || ''
				};
			})
		};
	});
}

/**
 * prevent links on resource page from pointing to /find
 */
function replacePath(view: Link, usePath: string) {
	return {
		'@id': view['@id'].replace('/find', usePath)
	};
}
interface PropertyChainAxiom {
	propertyChainAxiom: (ObjectProperty | DatatypeProperty)[];
	label: string; // e.g. "instanceOf language"
	_key: string; // e.g. "instanceOf.language"
}
