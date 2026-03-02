import { getSupportedLocale, otherLocales } from '$lib/i18n/locales';
import { type FramedData, JsonLd, LensType, Platform } from '$lib/types/xl';
import { asArray, type DisplayUtil, toString } from '$lib/utils/xl';
import type { QualifierDefinition } from '$lib/types/search';
import { getUriSlug } from '$lib/utils/http';

export async function load({ locals, params }) {
	const locale = getSupportedLocale(params?.lang);

	const collator = new Intl.Collator(locale).compare;

	const filters = locals.vocab.getPropertiesByCategory(Platform.searchfilter);
	const filterDefs = filters
		.map((p) => mapSearchFilterDefinition(p, locale, locals.display))
		.filter((p) => p !== null)
		.sort((a, b) => collator(a?.label, b?.label));

	return {
		filters: filters,
		filterDefs: filterDefs
	};
}

function mapSearchFilterDefinition(
	def: FramedData,
	locale,
	display: DisplayUtil
): QualifierDefinition | null {
	try {
		const otherLangLabels = otherLocales(locale).map((l) =>
			toString(display.lensAndFormat(def, LensType.Chip, l))
		);
		const key = getUriSlug(def[JsonLd.ID]) as string;

		return {
			// FIXME???,
			key: key,
			label: toString(display.lensAndFormat(def, LensType.Chip, locale)),
			queryCodes: (asArray(def['librisQueryCode']) || []) as string[],
			altLabels: otherLangLabels,
			...(def['commentByLang']?.[locale] && { comment: def['commentByLang'][locale] })
		};
	} catch {
		return null;
	}
}
