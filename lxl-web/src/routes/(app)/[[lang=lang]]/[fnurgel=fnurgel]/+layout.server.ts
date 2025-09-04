import { getSupportedLocale } from '$lib/i18n/locales';
import type { ApiError } from '$lib/types/api.js';
import type { CSLJSON } from '$lib/types/citation.js';
import { getAvailableFormats, initCite } from '$lib/utils/citation.js';

export const load = async ({ url, fetch, params }) => {
	// makes this load function dependant on 'cite' param change
	const id = url.searchParams.get('cite');

	async function getData() {
		if (id) {
			let data;
			let error;

			// fetching the record again via cite api is needed as long as csl mapping depends on computedLabel
			const res = await fetch(`/api/cite?id=${id}&format=csl`);
			if (res.ok) {
				const citations: CSLJSON[] = await res.json();
				const locale = getSupportedLocale(params?.lang);
				const cite = await initCite(locale);
				cite.add(citations);

				const availableFormats = getAvailableFormats();
				data = availableFormats.map((format) => {
					return {
						...format,
						citation: cite?.formatAs(format.key) as string
					};
				});
			} else {
				error = (await res.json()) as ApiError;
			}

			return { data, error };
		}
	}
	return { citations: getData() };
};
