import { getSupportedLocale, type LocaleCode, otherLocales } from '#lib/i18n/locales.js';
import { type Data, type FramedData, JsonLd, LensType, Platform } from '#lib/types/xl.js';
import { asArray, toString } from '#lib/utils/misc.js';
import { type DisplayUtil, VocabUtil } from '#lib/utils/xl.server.js';
import type { QualifierDefinition, QualifierDefinitionGroup } from '#lib/types/search.js';
import { getUriSlug } from '#lib/utils/http.js';
import { getCompactUri } from 'lxljs/string';
import { resolveSearchPaths, type SearchPathContext } from './searchPaths.js';

export async function load({ locals, params }) {
	const locale = getSupportedLocale(params?.lang);
	const groupedFilters = locals.vocab.getDefinition(Platform.filters);
	const all = asArray<unknown>(
		(groupedFilters?.items as Data | undefined)?.[JsonLd.LIST]
	) as Data[];

	const filterGroups: QualifierDefinitionGroup[] = all.map((group) => ({
		filters: (asArray<unknown>((group.items as Data | undefined)?.[JsonLd.LIST]) as Data[])
			.map((p) => locals.vocab.getDefinition(p[JsonLd.ID] as string))
			.map((p) => mapSearchFilterDefinition(p, locale, locals.vocab, locals.display))
			.filter((p): p is QualifierDefinition => p !== null),
		label: locals.display.getTranslated(group, 'label', locale),
		filterGroupDescription: locals.display.getTranslated(group, 'ls:filterGroupDescription', locale)
	}));
	return {
		filterGroups: filterGroups
	};
}

function mapSearchFilterDefinition(
	def: FramedData,
	locale: LocaleCode,
	vocab: VocabUtil,
	display: DisplayUtil
): QualifierDefinition | null {
	try {
		const otherLangLabels = otherLocales(locale).map((l) =>
			toString(display.lensAndFormat(def, LensType.Chip, l))
		);
		const key = getUriSlug(def[JsonLd.ID] as string) as string;
		const ctx: SearchPathContext = {
			locale,
			getDefinition: (name) => vocab.getDefinition(name),
			chipLabel: (d) => (d ? toString(display.lensAndFormat(d, LensType.Chip, locale)) : ''),
			compactIri: (iri) => getCompactUri(iri, vocab.context)
		};

		return {
			key: key,
			label: toString(display.lensAndFormat(def, LensType.Chip, locale)),
			queryCodes: (asArray(def['librisQueryCode']) || []) as string[],
			altLabels: otherLangLabels,
			filterDescription: display.getTranslated(def, 'ls:filterDescription', locale),
			searchPaths: resolveSearchPaths(def, ctx),
			descriptionRemark: (asArray(display.getTranslated(def, 'ls:descriptionRemark', locale)) ||
				[]) as string[]
		};
	} catch (error) {
		console.warn('Error mapping filter definition', error);
		return null;
	}
}
