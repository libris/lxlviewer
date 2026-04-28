import { getSupportedLocale, otherLocales } from '$lib/i18n/locales';
import {
	type FramedData,
	JsonLd,
	LensType,
	type Link,
	LxlJs,
	Owl,
	Platform,
	Rdfs
} from '$lib/types/xl';
import { asArray, toString, isObject } from '$lib/utils/xl';
import { type DisplayUtil, isLink, VocabUtil } from '$lib/utils/xl.server';
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
	} catch (error) {
		console.warn('Error mapping filter definition', error);
		return null;
	}
}

function mapPropertyChain(
	def: FramedData,
	locale,
	vocab: VocabUtil,
	display: DisplayUtil
): PropertyChain[] | null {
	const propertyChainAxiom = asArray(def[Owl.PROPERTY_CHAIN_AXIOM]) as PropertyChainAxiom[];

	if (
		propertyChainAxiom.length == 0 ||
		propertyChainAxiom.some(
			(a) => !a[JsonLd.LIST] || a[JsonLd.LIST].some((o) => !isLink(o) && !isRRSC(o))
		)
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
		const path = c[JsonLd.LIST]
			.map((p) => (isLink(p) ? getUriSlug(p[JsonLd.ID]) : formatRRSCPath(p)))
			.join('.');
		const label = c[JsonLd.LIST]
			.map((p) =>
				isLink(p)
					? vocabLabel(p, locale, vocab, display)
					: formatRRSCLabel(p, locale, vocab, display)
			)
			.join(' › ');
		return {
			label: label,
			path: path
		};
	});

	return baseOf.concat(chains);
}

function formatRRSCLabel(
	def: RangeRestrictionSubClass,
	locale,
	vocab: VocabUtil,
	display: DisplayUtil
) {
	const s = vocabLabel(def[Rdfs.subPropertyOf][0], locale, vocab, display);
	if (isLink(def[Rdfs.range][0])) {
		const v = vocabLabel(def[Rdfs.range][0], locale, vocab, display);

		return `${s} [${v}]`;
	} else {
		const p = vocabLabel(
			def[Rdfs.range][0][Rdfs.subClassOf][0][Owl.onProperty],
			locale,
			vocab,
			display
		);
		const vv = def[Rdfs.range][0][Rdfs.subClassOf][0][Owl.hasValue];
		const v = isLink(vv) ? `<${getUriSlug(vv[JsonLd.ID])}>` : vv;

		return `${s} [${p}: ${v}]`;
	}
}

function formatRRSCPath(def: RangeRestrictionSubClass) {
	const s = getUriSlug(def[Rdfs.subPropertyOf][0][JsonLd.ID]);
	if (isLink(def[Rdfs.range][0])) {
		const v = getUriSlug(def[Rdfs.range][0][JsonLd.ID]);
		return `${s}[${v}]`;
	} else {
		const p = getUriSlug(def[Rdfs.range][0][Rdfs.subClassOf][0][Owl.onProperty][JsonLd.ID]);
		const vv = def[Rdfs.range][0][Rdfs.subClassOf][0][Owl.hasValue];
		const v = isLink(vv) ? `<${getUriSlug(vv[JsonLd.ID])}>` : vv;

		return `${s}[${p}=${v}]`;
	}
}

function vocabLabel(l: Link, locale, vocab: VocabUtil, display: DisplayUtil): string {
	return toString(display.lensAndFormat(vocab.getDefinition(l), LensType.Chip, locale));
}

function isRRSC(data: unknown): data is RangeRestrictionSubClass {
	// handle this exact shape for now
	if (!isObject(data)) {
		return false;
	}

	const isSubPropertyOf =
		Array.isArray(data[Rdfs.subPropertyOf]) &&
		data[Rdfs.subPropertyOf].length === 1 &&
		isLink(data[Rdfs.subPropertyOf][0]);

	const hasRange =
		Array.isArray(data[Rdfs.range]) &&
		data[Rdfs.range].length === 1 &&
		(isLink(data[Rdfs.range][0]) ||
			(isObject(data[Rdfs.range][0]) &&
				Array.isArray(data[Rdfs.range][0][Rdfs.subClassOf]) &&
				data[Rdfs.range][0][Rdfs.subClassOf].length == 1 &&
				isOwlRestriction(data[Rdfs.range][0][Rdfs.subClassOf][0])));

	return isSubPropertyOf && hasRange;
}

type PropertyChainAxiom = {
	[JsonLd.LIST]: (Link | RangeRestrictionSubClass)[];
};

function isOwlRestriction(data: unknown): data is OwlRestriction {
	return (
		isObject(data) &&
		data[JsonLd.TYPE] == Owl.Restriction &&
		(typeof data[Owl.hasValue] === 'string' || isLink(data[Owl.hasValue])) &&
		isLink(data[Owl.onProperty])
	);
}

// TODO? unify with xl.ts RangeRestriction?
type RangeRestrictionSubClass = {
	[Rdfs.subPropertyOf]: [Link];
	[Rdfs.range]: [{ [Rdfs.subClassOf]: [OwlRestriction] } | Link];
};

type OwlRestriction = {
	[JsonLd.TYPE]: Owl.Restriction;
	[Owl.hasValue]: Link | string;
	[Owl.onProperty]: Link;
};
