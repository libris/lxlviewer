import type { QualifierSuggestion } from '$lib/types/search';
import { type FramedData } from '$lib/types/xl';
import type { LocaleCode } from '$lib/i18n/locales';

function itemAsQualifiers(item: FramedData, locale: LocaleCode): QualifierSuggestion[] {
	const qualifiers = item['_qualifiers'];
	return qualifiers.map((qualifier) => {
		const predicate = qualifier['_predicate'];
		const label = predicate.labelByLang?.[locale] || predicate.label;
		return {
			label: label,
			_q: qualifier['_q'],
			cursor: qualifier['_cursor']
		};
	});
}

export default itemAsQualifiers;
