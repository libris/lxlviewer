import type { Slice, Observation, Facet, FacetValue, FacetRange } from '$lib/types/search';
import type { TranslateFn } from '$lib/i18n';
import type { LocaleCode } from '$lib/i18n/locales';
import { JsonLd, LensType } from '$lib/types/xl';

import { DisplayUtil, toLite } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';
import { getUriSlug } from '$lib/utils/http';
import { replacePath } from '$lib/utils/search';

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
		label: translate(`facet.${slice.alias || slice.dimension}`),
		operator: slice._connective,
		maxItems: slice.maxItems,
		search: slice.search,
		alias: slice.alias,
		selected: observation?._selected
	};

	const sortedObservations =
		facet.operator === 'AND'
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
				// translate,
				usePath
			});
		})
	};
}

function getFacetValue({
	observation,
	dimension,
	displayUtil,
	locale,
	// translate,
	usePath
}: {
	observation: Observation;
	dimension: string;
	displayUtil: DisplayUtil;
	locale: LocaleCode;
	// translate: TranslateFn;
	usePath?: string;
}): FacetValue | FacetRange {
	return {
		dimension,
		label: toLite(displayUtil.lensAndFormat(observation.object, LensType.Chip, locale)),
		discriminator: getUriSlug(getAtPath(observation.object, ['inScheme', JsonLd.ID], '')),
		view: replacePath(observation.view, usePath),
		totalItems: observation.totalItems,
		selected: observation._selected
		/* children: observation.sliceByDimension
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
		*/
	};
}
