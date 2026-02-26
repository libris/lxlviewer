import { env } from '$env/dynamic/private';
import type { MappingsOnlyPartialCollectionView, QualifierSuggestion2 } from '$lib/types/search';
import { getTranslator } from '$lib/i18n/index.js';
import { getSupportedLocale, type LocaleCode, otherLocales } from '$lib/i18n/locales.js';
import { displayMappings } from '$lib/utils/search';
import { type FramedData, JsonLd, LensType, Platform } from '$lib/types/xl';
import { type DisplayUtil, toString, VocabUtil } from '$lib/utils/xl';
import { getUriSlug } from '$lib/utils/http';

export async function load({ locals, url, params, fetch }) {
	const userSettings = locals.userSettings;
	let subsetMapping;
	const r = url.searchParams.get('_r');
	// get the label for a subset filter on any page
	if (r && r !== '*') {
		const res = await fetch(
			`${env.API_URL}/find.jsonld?${new URLSearchParams({
				_r: r,
				_q: '',
				_mappingOnly: 'true'
			}).toString()}`
		);

		if (res.ok) {
			const data = (await res.json()) as MappingsOnlyPartialCollectionView;

			const locale = getSupportedLocale(params?.lang);
			const translator = await getTranslator(locale);
			const mappings = displayMappings(data, locals.display, locale, translator, url.pathname);
			subsetMapping = mappings.filter((m) => m.variable === '_r');
			// add to locals for access in other load functions
			locals.subsetMapping = subsetMapping;
		} else {
			console.warn('Failed to get _r mappings');
		}
	}

	const siteName = locals.site?.name;

	const locale = getSupportedLocale(params?.lang);
	const qualifierSuggestions = getQualifierSuggestions(locale, locals.vocab, locals.display);

	return {
		userSettings,
		subsetMapping,
		siteName,
		qualifierSuggestions
	};
}

function getQualifierSuggestions(locale: LocaleCode, vocab: VocabUtil, display: DisplayUtil) {
	const collator = new Intl.Collator(locale).compare;

	return vocab
		.getPropertiesByCategory(Platform.searchfilter)
		.map((p) => mapSearchFilterDefinition(p, locale, display))
		.filter((p) => p !== null)
		.sort((a, b) => collator(a?.label, b?.label))
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
	locale,
	display: DisplayUtil
): QualifierSuggestion2 | null {
	try {
		const codes = def['librisQueryCode'] || [];
		const otherLangLabels = otherLocales(locale).map((l) =>
			toString(display.lensAndFormat(def, LensType.Chip, l))
		);

		return {
			// FIXME???,
			key: getUriSlug(def[JsonLd.ID]),
			label: toString(display.lensAndFormat(def, LensType.Chip, locale)),
			altCodesAndLabels: codes.concat(otherLangLabels)
		};
	} catch {
		return null;
	}
}

// TODO where do we specify this?
const CURATED_QUALIFIERS = ['contributor', 'language', 'title', 'yearPublished', 'subject'];

const CURATED_ORDER = new Map(CURATED_QUALIFIERS.map((value, index) => [value, index]));
