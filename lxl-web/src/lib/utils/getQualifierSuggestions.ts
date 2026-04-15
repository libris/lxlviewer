import { type LocaleCode, otherLocales } from '$lib/i18n/locales';
import { asArray, type DisplayUtil, toString, VocabUtil } from '$lib/utils/xl';
import { type FramedData, JsonLd, LensType, Platform } from '$lib/types/xl';
import type { QualifierSuggestion2 } from '$lib/types/search';
import { getUriSlug } from '$lib/utils/http';

export function getQualifierSuggestions(
	locale: LocaleCode,
	vocab: VocabUtil,
	display: DisplayUtil
) {
	const compare = new Intl.Collator(locale).compare;

	return vocab
		.getPropertiesByCategory(Platform.searchfilter)
		.map((p) => mapSearchFilterDefinition(p, locale, display, compare))
		.filter((p) => p !== null)
		.sort((a, b) => compare(a?.label, b?.label))
		.sort((a, b) => {
			const aIx = CURATED_ORDER.get(a.key);
			const bIx = CURATED_ORDER.get(b.key);
			if (aIx !== undefined && bIx !== undefined) {
				return aIx - bIx;
			}
			if (aIx !== undefined) {
				return -1;
			}
			if (bIx !== undefined) {
				return 1;
			}
			return 0;
		});
}

function mapSearchFilterDefinition(
	def: FramedData,
	locale: LocaleCode,
	display: DisplayUtil,
	compare: (x: string, y: string) => number
): QualifierSuggestion2 | null {
	try {
		const otherLangLabels = otherLocales(locale).map((l) =>
			toString(display.lensAndFormat(def, LensType.Chip, l))
		);
		const key = getUriSlug(def[JsonLd.ID]) as string;

		return {
			// FIXME???,
			key: key,
			label: toString(display.lensAndFormat(def, LensType.Chip, locale)),
			queryCodes: ((asArray(def['librisQueryCode']) || []) as string[]).sort((a, b) =>
				compare(a, b)
			),
			altLabels: otherLangLabels,
			...(CURATED_QUALIFIERS.includes(key) && { curated: true })
		};
	} catch (error) {
		console.warn('Error mapping filter definition', error);
		return null;
	}
}

// TODO where do we specify this?
const CURATED_QUALIFIERS = [
	'contributor',
	'title',
	'language',
	'yearPublished',
	'subject',
	'originalLanguage'
];
const CURATED_ORDER = new Map(CURATED_QUALIFIERS.map((value, index) => [value, index]));
