import { getSupportedLocale, otherLocales } from '$lib/i18n/locales';
import { type FramedData, JsonLd, LensType, LxlJs, Owl, Platform } from '$lib/types/xl';
import { asArray, type DisplayUtil, isLink, toString, VocabUtil } from '$lib/utils/xl';
import type { PropertyChain, QualifierDefinition } from '$lib/types/search';
import { getUriSlug } from '$lib/utils/http';

export async function load({ locals, params }) {
	const locale = getSupportedLocale(params?.lang);

	const collator = new Intl.Collator(locale).compare;

	const filters = locals.vocab.getPropertiesByCategory(Platform.searchfilter);
	const filterDefs = filters
		.map((p) => mapSearchFilterDefinition(p, locale, locals.vocab, locals.display))
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
	vocab: VocabUtil,
	display: DisplayUtil
): QualifierDefinition | null {
	try {
		const otherLangLabels = otherLocales(locale).map((l) =>
			toString(display.lensAndFormat(def, LensType.Chip, l))
		);
		const key = getUriSlug(def[JsonLd.ID]) as string;

		const propertyChain = mapPropertyChain(def, locale, vocab, display);

		return {
			// FIXME???,
			key: key,
			label: toString(display.lensAndFormat(def, LensType.Chip, locale)),
			queryCodes: (asArray(def['librisQueryCode']) || []) as string[],
			altLabels: otherLangLabels,
			...(def['commentByLang']?.[locale] && { comment: def['commentByLang'][locale] }),
			...(propertyChain && { propertyChainAxiom: propertyChain })
		};
	} catch {
		return null;
	}
}

function mapPropertyChain(
	def: FramedData,
	locale,
	vocab: VocabUtil,
	display: DisplayUtil
): PropertyChain[] | null {
	const propertyChainAxiom = asArray(def[Owl.PROPERTY_CHAIN_AXIOM]);

	if (
		propertyChainAxiom.length == 0 ||
		propertyChainAxiom.some((a) => !a[JsonLd.LIST] || a[JsonLd.LIST].some((o) => !isLink(o)))
	) {
		return null;
	}

	// FIXME: lxljs hasCategory can't handle ls namespace
	//const basePropertyOf = vocab.hasCategory(def, Platform.composite)
	const basePropertyOf = (def['category'] || []).some((c) => c[JsonLd.ID] === Platform.composite)
		? asArray(def[LxlJs.BASE_PROPERTY_OF])
		: [];

	const baseOf = basePropertyOf.map((p) => {
		const path = getUriSlug(p[JsonLd.ID]);
		const label = toString(display.lensAndFormat(p, LensType.Chip, locale));
		return {
			label: label,
			path: path
		};
	});

	const chains = propertyChainAxiom.map((c) => {
		const props = c[JsonLd.LIST].map((p) => vocab.getDefinition(p));
		const path = props.map((p) => getUriSlug(p[JsonLd.ID])).join('.');
		const label = props
			.map((p) => toString(display.lensAndFormat(p, LensType.Chip, locale)))
			.join(' › ');
		return {
			label: label,
			path: path
		};
	});

	return baseOf.concat(chains);
}
