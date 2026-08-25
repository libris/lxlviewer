import fs from 'fs';
import {
	type HandleServerError,
	redirect,
	type RequestEvent,
	type ServerInit
} from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { defaultLocale, Locales } from '$lib/i18n/locales';
import { DERIVED_LENSES } from '$lib/types/display';
import type { QualifierSuggestion2 } from '$lib/types/search';
import type { Site } from '$lib/types/site';
import {
	DebugFlags,
	type MyLibrariesType,
	SettingsParams,
	type UserSettings
} from '$lib/types/userSettings';
import displayWeb from '$lib/assets/json/display-web.json';
import { DisplayUtil, VocabUtil } from '$lib/utils/xl.server';
import { getLibrary, getOrgMembers, startRefreshLibraries } from '$lib/utils/getLibraries.server';
import { getSubsetMapping } from '$lib/utils/subsetCache.server';
import { getQualifierSuggestions } from '$lib/utils/getQualifierSuggestions.server';
import { updateSettings } from '$lib/utils/userSettings.svelte';
import { JsonLd } from '$lib/types/xl';

type QualifierSuggestionsByLocale = Record<keyof typeof Locales, QualifierSuggestion2[]>;
type Util = [VocabUtil, DisplayUtil, QualifierSuggestionsByLocale];
let utilCache: Promise<Util> | undefined;
const subsiteCache: Record<string, Promise<Site>> = {};

// Warm up caches immediately on startup instead of waiting for a request
export const init: ServerInit = async () => {
	try {
		const [, displayUtil] = await loadUtilCached();
		startRefreshLibraries(displayUtil, defaultLocale);

		(env['SUBSITES'] || '')
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
			.map((site) => env[`SUBSITE.${site}.SEARCH_SITE`])
			.filter((s) => typeof s === 'string')
			.forEach((s) => getSiteConfCached(s));
	} catch (err) {
		// This is OK, handle() will retry
		console.error('Startup initialization failed:', err);
	}
};

export const handle = async ({ event, resolve }) => {
	const [vocabUtil, displayUtil, qualifierSuggestionsByLocale] = await loadUtilCached();

	// Fallback in case startup init failed. No-op if refresh already started.
	startRefreshLibraries(displayUtil, defaultLocale);

	event.locals.vocab = vocabUtil;
	event.locals.display = displayUtil;

	const legacySetOrg = event.url.searchParams.get('setorg');
	if (legacySetOrg) {
		const clean = legacySetOrg.replaceAll(/[^A-Za-z0-9]/g, '');
		redirect(302, `?_r=itemHeldByOrg:${clean}`);
	}

	const site = await getSite(event);

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
	let cookieEdit = false;
	let redirectHome = false;

	if (event.url.searchParams.has('_debug')) {
		let flags = event.url.searchParams
			.getAll('_debug')
			.filter((s) => Object.values(DebugFlags).includes(s as DebugFlags)) as DebugFlags[];

		if (event.url.searchParams.getAll('_debug').includes('false')) {
			flags = [];
		}

		userSettings.debug = flags;
		cookieEdit = true;
	}

	const myLibraries = userSettings.myLibraries;
	if (myLibraries && !isValidMyLibraries(myLibraries)) {
		// wipe myLibraries if wrong format
		userSettings.myLibraries = {};
		cookieEdit = true;
	}

	if (Object.values(SettingsParams).some((p) => event.url.searchParams.has(p))) {
		updateSettings(
			userSettings,
			event.url.searchParams,
			(id) => !!(getLibrary(id) || getOrgMembers(id).length > 0)
		);

		cookieEdit = true;
		redirectHome = true;
	}

	if (cookieEdit) {
		event.cookies.set('userSettings', JSON.stringify(userSettings), {
			maxAge: 60 * 60 * 24 * 365, // 365 days
			secure: true,
			sameSite: 'strict',
			httpOnly: false, // allow the client to write to this cookie
			path: '/'
		});
	}

	event.locals.userSettings = userSettings;

	// fjärrlån
	const librisSessionCookie = event.cookies.get('LIBRIS_SESSION');
	if (librisSessionCookie) {
		event.locals.librisSession = librisSessionCookie;
	}

	// set legacy cookies site-wide
	const upgraded = event.cookies.get('cookiesDomainUpgraded');

	if (!upgraded) {
		const LEGACY_COOKIES = ['myLibrary', 'myOrg', 'myPosts', 'showrecView'];

		const host = event.url.hostname === 'localhost' ? event.url.hostname : `.${event.url.hostname}`;

		let anyUpgraded = false;

		for (const name of LEGACY_COOKIES) {
			const value = event.cookies.get(name);

			if (value) {
				event.cookies.set(name, value, {
					maxAge: 60 * 60 * 24 * 365, // 365 days
					secure: true,
					domain: host,
					sameSite: 'lax',
					httpOnly: true,
					path: '/',
					encode: (val) => val // disable encoding
				});

				anyUpgraded = true;
			}
		}

		if (anyUpgraded) {
			event.cookies.set('cookiesDomainUpgraded', 'true', {
				maxAge: 60 * 60 * 24 * 365, // 365 days
				secure: true,
				sameSite: 'strict',
				httpOnly: true,
				path: '/'
			});
		}
	}

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
	const dataTheme = site?.configuration?.themeName || 'libris';
	const favicon = site?.configuration?.favicon || 'libris';

	// get subset mapping
	const _r = event.url.searchParams.get('_r');
	const subsetMapping = await getSubsetMapping(_r, event.locals, lang);
	event.locals.subsetMapping = subsetMapping;

	event.locals.qualifierSuggestionsByLocale = qualifierSuggestionsByLocale;

	if (redirectHome) {
		const path = lang === defaultLocale ? '/' : '/' + lang;
		const query = _r ? '?_r=' + _r : '';
		redirect(302, path + query);
	}

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%lang%', lang).replace('%theme%', dataTheme).replace('%favicon%', favicon)
	});
};

function isValidMyLibraries(value: unknown): value is MyLibrariesType {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	for (const [key, val] of Object.entries(value)) {
		if (typeof key !== 'string') return false;
		if (typeof val !== 'string') return false;
	}

	return true;
}

function loadUtilCached() {
	if (!utilCache) {
		utilCache = loadUtil().catch((err) => {
			utilCache = undefined;
			throw err;
		});
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
	const displayUtil = new DisplayUtil(display, vocabUtil, Object.keys(Locales));

	DERIVED_LENSES.forEach((l) => displayUtil.registerDerivedLens(l));

	const qualifierSuggestionsByLocale = {} as QualifierSuggestionsByLocale;
	(Object.keys(Locales) as Array<keyof typeof Locales>).forEach((locale) => {
		qualifierSuggestionsByLocale[locale] = getQualifierSuggestions(locale, vocabUtil, displayUtil);
	});
	console.info('Loaded qualifierSuggestionsByLocale');

	return [vocabUtil, displayUtil, qualifierSuggestionsByLocale];
}

function getSite(event: RequestEvent): Promise<Site> | null {
	// TODO replace this with proper domain matching
	const deepestSubDomain = event.url.hostname.split('.')[0];

	if (configuredSubDomains().includes(deepestSubDomain)) {
		// TODO fetch from backend?
		const site = deepestSubDomain;
		const siteUrl = env[`SUBSITE.${site}.SEARCH_SITE`];
		if (!siteUrl) {
			return null;
		}
		return getSiteConfCached(siteUrl);
	}

	return null;
}

async function getSiteConfCached(siteUrl: string) {
	if (!subsiteCache[siteUrl]) {
		subsiteCache[siteUrl] = loadSiteConf(siteUrl).catch((err) => {
			delete subsiteCache[siteUrl];
			throw err;
		});
	}
	return subsiteCache[siteUrl];
}

async function loadSiteConf(siteUrl: string): Promise<Site> {
	const fetchUrl = `${env.API_URL}/${siteUrl}?nocache=1`;
	console.log(`Fetching ${fetchUrl}`);
	const response = await fetch(fetchUrl, {
		headers: { Accept: 'application/ld+json' },
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(
			`Failed to load site conf: ${fetchUrl} ${response.status} ${response.statusText}`
		);
	}
	const conf = (await response.json())[JsonLd.GRAPH][1];

	const site = {
		name: conf['title'],
		searchSite: siteUrl,
		configuration: conf['lxlwebConfiguration']
	};
	console.log(`Loaded site conf: ${JSON.stringify(site, null, 2)}`);
	return site;
}

function configuredSubDomains(): string[] {
	return env.SUBSITES?.split(',').map((s) => s.trim()) || [];
}

export const handleError: HandleServerError = ({ error, event, status }) => {
	if (status >= 500) {
		console.error(`[${status}] ${event.request.method} ${event.url.pathname}${event.url.search}`);
		console.error(error);
	}
};
