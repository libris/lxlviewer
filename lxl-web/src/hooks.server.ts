import type { Handle, HandleFetch } from '@sveltejs/kit';
import { defaultLocale, Locales } from '$lib/i18n/locales';
import { env } from '$env/dynamic/private';
import { USE_LOCAL_DISPLAY_JSONLD } from '$env/static/private';
import { env } from '$env/dynamic/private';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl';
import fs from 'fs';

let utilCache;

export const handle: Handle = async ({ event, resolve }) => {
	const [vocabUtil, displayUtil] = await loadUtilCached();
	event.locals.vocab = vocabUtil;
	event.locals.display = displayUtil;

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

async function loadUtilCached() {
	if (!utilCache) {
		utilCache = loadUtil();
	}
	return utilCache;
}

// TODO move
// TODO error handling
async function loadUtil() {
	const [contextRes, vocabRes, displayRes] = await Promise.all([
		fetch(`${env.ID_URL}/context.jsonld`),
		fetch(`${env.ID_URL}/vocab/data.jsonld`),
		fetch(`${env.ID_URL}/vocab/display/data.jsonld`)
	]);

	const context = await contextRes.json();
	const vocab = await vocabRes.json();
	let display = await displayRes.json();

	if (USE_LOCAL_DISPLAY_JSONLD === 'true') {
		const path = '../../definitions/source/vocab/display.jsonld';
		const displayJson = fs.readFileSync(path, { encoding: 'utf8' });
		display = JSON.parse(displayJson);
		console.warn(`USE_LOCAL_DISPLAY_JSONLD true. Using ${path}`);
	}

	const vocabUtil = new VocabUtil(vocab, context);
	const displayUtil = new DisplayUtil(display, vocabUtil);
	return [vocabUtil, displayUtil];
}
