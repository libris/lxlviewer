import type {
	Slice,
	Observation,
	Facet,
	FacetValue,
	FacetRange,
	FacetTreeItem,
	FacetTreeItemValue
} from '$lib/types/search';
import type { TranslateFn } from '$lib/i18n';
import type { LocaleCode } from '$lib/i18n/locales';
import { JsonLd, LensType } from '$lib/types/xl';

import { DisplayUtil, toLite, toString } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';
import { getUriSlug } from '$lib/utils/http';
import { replacePath } from '$lib/utils/search';

export function getFacetTreeItem({
	slice,
	observation,
	parentDimension,
	displayUtil,
	locale,
	translate,
	usePath
}: {
	slice: Slice;
	observation?: Observation;
	parentDimension?: string;
	displayUtil: DisplayUtil;
	locale: LocaleCode;
	translate: TranslateFn;
	usePath?: string;
}): FacetTreeItem {
	const dimension = (parentDimension ? `${parentDimension}/` : '') + slice.dimension;

	const sortedObservations =
		slice._connective === 'AND' && slice.dimension !== '_categoryByCollection.find'
			? [
					...slice.observation.filter((observationItem) => observationItem._selected),
					...slice.observation.filter((observationItem) => !observationItem._selected)
				]
			: slice.observation;

	return {
		key: dimension,
		selected: observation?._selected, // will this ever be selected?
		items: sortedObservations.map((observationItem) => {
			return getFacetTreeItemValue({
				observation: observationItem,
				dimension,
				displayUtil,
				locale,
				translate,
				usePath
			});
		}),
		setsize:
			observation?.totalItems && observation.totalItems < slice.maxItems // we should only return setsize if we are sure total items is less than slice max possible items
				? observation?.totalItems
				: undefined,
		data: {
			dimension,
			view: observation ? replacePath(observation.view, usePath) : undefined,
			label: getFacetLabel({ data: slice, displayUtil, locale, translate }),
			operator: slice._connective,
			maxItems: slice.maxItems,
			alias: slice.alias
		}
	};
}

function getFacetTreeItemValue({
	observation,
	displayUtil,
	locale,
	translate,
	usePath
}: {
	observation: Observation;
	dimension: string;
	displayUtil: DisplayUtil;
	locale: LocaleCode;
	translate: TranslateFn;
	usePath?: string;
}): FacetTreeItemValue {
	return {
		key: replacePath(observation.view, usePath)?.['@id'],
		selected: observation._selected,
		data: {
			label: getFacetLabel({ data: observation, displayUtil, locale, translate }),
			view: replacePath(observation.view, usePath),
			totalItems: observation.totalItems
		}
	};
}

export function getFacet({
	slice,
	observation,
	parentDimension,
	displayUtil,
	locale,
	translate,
	usePath
}: {
	slice: Slice;
	observation?: Observation;
	parentDimension?: string;
	displayUtil: DisplayUtil;
	locale: LocaleCode;
	translate: TranslateFn;
	usePath?: string;
}): Facet {
	const dimension = (parentDimension ? `${parentDimension}/` : '') + slice.dimension;

	const facet = {
		dimension,
		view: observation ? replacePath(observation.view, usePath) : undefined,
		label: getFacetLabel({ data: slice, displayUtil, locale, translate }),
		operator: slice._connective,
		maxItems: slice.maxItems,
		search: slice.search,
		alias: slice.alias,
		selected: observation?._selected
	};

	const sortedObservations =
		facet.operator === 'AND' && slice.dimension !== '_categoryByCollection.find'
			? [
					...slice.observation.filter((observationItem) => observationItem._selected),
					...slice.observation.filter((observationItem) => !observationItem._selected)
				]
			: slice.observation;

	return {
		...facet,
		values: sortedObservations.map((observationItem) => {
			return getFacetValue({
				observation: observationItem,
				dimension,
				displayUtil,
				locale,
				translate,
				usePath,
				parentFacet: facet
			});
		})
	};
}

function getFacetLabel({
	data,
	displayUtil,
	locale,
	translate
}: {
	data: Slice | Observation;
	displayUtil: DisplayUtil;
	locale: LocaleCode;
	translate: TranslateFn;
}) {
	if ('object' in data) {
		const decorated = toLite(displayUtil.lensAndFormat(data.object, LensType.Chip, locale));
		return {
			decorated,
			str: toString(decorated),
			discriminator: getUriSlug(getAtPath(data.object, ['inScheme', JsonLd.ID], ''))
		};
	} else {
		return translate(`facet.${data.alias || data.dimension}`);
	}
}

function getFacetValue({
	observation,
	dimension,
	displayUtil,
	locale,
	translate,
	usePath,
	parentFacet
}: {
	observation: Observation;
	dimension: string;
	displayUtil: DisplayUtil;
	locale: LocaleCode;
	translate: TranslateFn;
	usePath?: string;
}): FacetValue | FacetRange {
	return {
		label: getFacetLabel({ data: observation, displayUtil, locale, translate }),
		view: replacePath(observation.view, usePath),
		totalItems: observation.totalItems,
		selected: observation._selected,
		parentFacet,
		facets: observation.sliceByDimension
			? Object.values(observation.sliceByDimension).map((slice) =>
					getFacet({
						slice,
						observation,
						parentDimension: dimension,
						displayUtil,
						locale,
						translate,
						usePath
					})
				)
			: undefined
	};
}
