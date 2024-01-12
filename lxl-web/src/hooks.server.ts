import { defaultLocale, Locales } from '$lib/i18n/locales';

export const handle = async ({ event, resolve }) => {
	// set HTML lang
	// https://github.com/sveltejs/kit/issues/3091#issuecomment-1112589090
	const path = event.url.pathname;
	let lang = defaultLocale;

	Object.keys(Locales).forEach((locale) => {
		if (path && path.startsWith(`/${locale}/`)) {
			lang = locale;
		}
	});

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
