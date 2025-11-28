import fs from 'fs';
import type { RequestEvent, ServerInit } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { defaultLocale, Locales } from '$lib/i18n/locales';
import { DERIVED_LENSES } from '$lib/types/display';
import type { Site } from '$lib/types/site';
import { DebugFlags, type UserSettings } from '$lib/types/userSettings';
import displayWeb from '$lib/assets/json/display-web.json';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl';
import { refreshLibraries } from '$lib/utils/getLibraries.server';

type Util = [VocabUtil, DisplayUtil];
let utilCache: Util | undefined;

export const init: ServerInit = async () => {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const [_, displayUtil] = await loadUtilCached();
	try {
		// get libraries at startup
		await refreshLibraries(displayUtil, defaultLocale);
	} catch (err) {
		console.error('Refreshing libraries failed at server init', err);
	}
};

export const handle = async ({ event, resolve }) => {
	const [vocabUtil, displayUtil] = await loadUtilCached();
	event.locals.vocab = vocabUtil;
	event.locals.display = displayUtil;

	const site = getSite(event);

	if (site) {
		event.locals.site = site;
	}

	// Parse & return settings cookie
	let userSettings: UserSettings = {};
	const settingsCookie = event.cookies.get('userSettings');
	if (settingsCookie) {
		try {
			userSettings = JSON.parse(settingsCookie);
		} catch (e) {
			console.warn('Failed to parse user settings', e);
		}
	}
	if (event.url.searchParams.has('_debug')) {
		let flags = event.url.searchParams
			.getAll('_debug')
			.filter((s) => Object.values(DebugFlags).includes(s as DebugFlags)) as DebugFlags[];

		if (event.url.searchParams.getAll('_debug').includes('false')) {
			flags = [];
		}

		userSettings.debug = flags;

		// TODO wipe myLibraries cookie if wrong format
		// const myLibraries = userSettings.myLibraries;
		// if (!Array.isArray(myLibraries) || myLibraries.some(v => typeof v === "object")) {
		// 	console.log('wipe my libraries')
		// 	// delete userSettings.myLibraries
		// }
		event.cookies.set('userSettings', JSON.stringify(userSettings), {
			maxAge: 365,
			secure: true,
			sameSite: 'strict',
			path: '/' // ???
		});
	}
	event.locals.userSettings = userSettings;

	// set HTML lang
	// https://github.com/sveltejs/kit/issues/3091#issuecomment-1112589090
	const path = event.url.pathname;
	let lang = defaultLocale;

	Object.keys(Locales).forEach((locale) => {
		if (path && (path.startsWith(`/${locale}/`) || path.endsWith(`/${locale}`))) {
			lang = locale;
		}
	});

	// set data-theme defined in themes.css
	const dataTheme = site?.themeName || 'libris';

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang).replace('%theme%', dataTheme)
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
async function loadUtil(): Promise<Util> {
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

function getSite(event: RequestEvent): Site | null {
	// TODO replace this with proper domain matching
	const deepestSubDomain = event.url.hostname.split('.')[0];

	if (configuredSubDomains().includes(deepestSubDomain)) {
		// TODO fetch from backend?
		const site = deepestSubDomain;
		return {
			name: env[`SUBSITE.${site}.NAME`] || site,
			themeName: env[`SUBSITE.${site}.APP_THEME`],
			searchSite: env[`SUBSITE.${site}.SEARCH_SITE`]
		};
	}

	return null;
}

function configuredSubDomains(): string[] {
	return env.SUBSITES?.split(',').map((s) => s.trim()) || [];
}
