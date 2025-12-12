import { getSupportedLocale } from '$lib/i18n/locales.js';
import { isLibraryOrg } from '$lib/utils/holdings.js';
import { getUriSlug } from '$lib/utils/http';

export async function load({ locals, params, fetch }) {
	const myLibraries = locals.userSettings.myLibraries;
	const locale = getSupportedLocale(params?.lang);

	if (myLibraries) {
		const myLibrariesIds = Object.keys(myLibraries);
		if (myLibrariesIds.length) {
			const queryArr = [];

			for (const id of myLibrariesIds) {
				if (isLibraryOrg(id)) {
					const code = getUriSlug(id);
					if (code) {
						queryArr.push(`code:${code}`);
					}
				} else {
					const sigel = getUriSlug(id);
					if (sigel) {
						queryArr.push(`sigel:${sigel}`);
					}
				}
			}
			const query = '(' + queryArr.join(' OR ') + ')';
			const res = await fetch(`/api/${locale}/my-pages?_q=${query}`);
			if (!res.ok) {
				return { error: `${res?.status} ${res?.statusText}` };
			}

			const result = await res.json();

			if (myLibrariesIds.length !== result.items?.length) {
				console.log('My libraries fetch mismatch!');
			}
			return { myLibraries: result.items };
		}
	}
	return {};
}
