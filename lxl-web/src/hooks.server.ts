import type { Handle, HandleFetch } from '@sveltejs/kit';
import { defaultLocale, Locales } from '$lib/i18n/locales';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	// set HTML lang
	// https://github.com/sveltejs/kit/issues/3091#issuecomment-1112589090
	const path = event.url.pathname;
	let lang = defaultLocale;

	Object.keys(Locales).forEach((locale) => {
		if (path && (path.startsWith(`/${locale}/`) || path.endsWith(`/${locale}`))) {
			lang = locale;
		}
	});

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	if (env.USE_LOCALHOST_API === 'true') {
		// Hit API directly bypassing whatever proxies and load balancers sit between it and the public internet).
		// clone the original request, but change the URL
		if (request.url.startsWith(env.API_URL)) {
			request = new Request(
				request.url.replace(env.API_URL, `http://localhost:${env.LOCALHOST_API_PORT}/`),
				request
			);
		}
		if (request.url.startsWith(env.ID_URL)) {
			request = new Request(
				request.url.replace(env.ID_URL, `http://localhost:${env.LOCALHOST_ID_PORT}/`),
				request
			);
		}
	}

	return fetch(request);
};
