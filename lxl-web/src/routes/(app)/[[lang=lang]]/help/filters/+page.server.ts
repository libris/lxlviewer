import { getSupportedLocale } from '$lib/i18n/locales';
import { LensType, Platform } from '$lib/types/xl';

export async function load({ locals, params }) {
	const locale = getSupportedLocale(params?.lang);

	const filters = locals.vocab.getPropertiesByCategory(Platform.searchfilter);
	const filterCards = filters.map((p) => locals.display.lensAndFormat(p, LensType.Card, locale));

	return {
		filters: filters,
		filterCards: filterCards
	};
}
