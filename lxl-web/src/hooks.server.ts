import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { env } from '$env/dynamic/private';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl';
import fs from 'fs';
import { DERIVED_LENSES } from '$lib/utils/display.types';
import displayWeb from '$lib/assets/json/display-web.json';

const preloadTypes = ['js', 'css', 'font'];
let utilCache: (VocabUtil | DisplayUtil)[];

export const customHandle: Handle = async ({ event, resolve }) => {
	const [vocabUtil, displayUtil] = await loadUtilCached();
	event.locals.vocab = vocabUtil;
	event.locals.display = displayUtil;

	return resolve(event, {
		preload: ({ type }) => preloadTypes.includes(type)
	});
};

async function loadUtilCached() {
	if (!utilCache) {
		utilCache = await loadUtil();
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

	if (env.USE_LOCAL_DISPLAY_JSONLD === 'true') {
		const path = '../../definitions/source/vocab/display.jsonld';
		const displayJson = fs.readFileSync(path, { encoding: 'utf8' });
		display = JSON.parse(displayJson);
		console.warn(`USE_LOCAL_DISPLAY_JSONLD true. Using ${path}`);
	}

	// Merge display with lxl-web display stuff
	// TODO later: move content back into definitions display.jsonld
	display.formatters = { ...display.formatters, ...displayWeb.formatters };
	Object.keys(displayWeb.lensGroups).forEach((g) => {
		if (display.lensGroups[g]) {
			Object.keys(displayWeb.lensGroups[g]['lenses']).forEach((l) => {
				display.lensGroups[g]['lenses'][l] = displayWeb.lensGroups[g]['lenses'][l];
			});
		} else {
			display.lensGroups[g] = displayWeb.lensGroups[g];
		}
	});

	const vocabUtil = new VocabUtil(vocab, context);
	const displayUtil = new DisplayUtil(display, vocabUtil);

	DERIVED_LENSES.forEach((l) => displayUtil.registerDerivedLens(l));

	return [vocabUtil, displayUtil];
}

const i18nHandle = i18n.handle();

export const handle = sequence(i18nHandle, customHandle);
