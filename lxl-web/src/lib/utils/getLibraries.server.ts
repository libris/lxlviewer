import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type {
	LibOrg,
	LibraryFull,
	LibraryId,
	LibraryRecord,
	LibraryWithLinks,
	OrgId
} from '$lib/types/holdings';
import { BibDb, JsonLd, LensType } from '$lib/types/xl';
import { gunzipSync } from 'node:zlib';
import { createHolderLinks } from '$lib/utils/holdings.server';
import { type DisplayUtil } from '$lib/utils/xl.server';
import { toString } from '$lib/utils/misc';
import type { LocaleCode } from '$lib/i18n/locales';

type Data = {
	[JsonLd.CONTEXT]: string[];
	[JsonLd.GRAPH]?: LibraryRecord[] | LibraryFull[];
}[];

type LibrariesCache = Map<LibraryId, LibraryWithLinks>;
type OrgCache = Map<OrgId, LibOrg>;

let librariesCache: LibrariesCache = new Map();
let orgCache: OrgCache = new Map();

const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 hrs?
let intervalStarted = false;

async function fetchLibOrgs() {
	const orgsArr = (await doFetch('bibdb:Organization')) as LibOrg[];
	const libraryMap = new Map(orgsArr.map((org) => [org[JsonLd.ID], org]));
	return libraryMap;
}

async function fetchLibraries(displayUtil: DisplayUtil, locale: LocaleCode) {
	const libraryArr = (await doFetch('Library')) as LibraryFull[];
	const libraryMap = new Map(
		libraryArr.map((lib) => [lib[JsonLd.ID], withLinks(lib, displayUtil, locale)])
	);
	return libraryMap;
}

async function doFetch(type: string) {
	const start = Date.now();

	const res = await fetch(
		`${env.API_URL}/api/emm/full?selection=type:${type}&download=.ndjsonld.gz`
	);
	if (!res.ok) {
		return error(res.status);
	}
	const gzipped = Buffer.from(await res.arrayBuffer());
	const text = gunzipSync(gzipped).toString('utf8');
	const data: Data = text
		.trim()
		.split('\n')
		.map((line) => JSON.parse(line));

	const builtData = buildData(data);

	const end = Date.now();
	console.log(`Fetching all of type ${type} took ${(end - start).toFixed(1)} ms`);
	return builtData;
}

function withLinks(
	lib: LibraryFull,
	displayUtil: DisplayUtil,
	locale: LocaleCode
): LibraryWithLinks {
	const links = createHolderLinks(lib, locale, displayUtil);
	const displayStr = toString(displayUtil.lensAndFormat(lib, LensType.Chip, locale));
	const library = { ...lib, ...{ _links: links }, ...{ displayStr } };
	delete library[BibDb.address];

	return library;
}

function buildData(data: Data) {
	const libraries: LibraryFull[] | LibOrg[] = [];

	for (const lib of data) {
		const graph = lib?.[JsonLd.GRAPH];
		if (!graph) continue;

		let record: LibraryRecord | null = null;
		let library: LibraryFull | null = null;
		let org: LibOrg | null = null;

		for (const item of graph) {
			const type = item[JsonLd.TYPE];
			if (type === 'Record') {
				record = item as LibraryRecord;
			} else if (type === 'Library') {
				library = item as LibraryFull;
			} else if (type === 'bibdb:Organization') {
				org = item as LibOrg;
			}
		}

		if (record && library) {
			libraries.push({
				...library,
				meta: record
			});
		} else if (org) {
			libraries.push(org);
		}
	}
	return libraries;
}

function buildOrgIndex(libraries: LibrariesCache, orgs: OrgCache): Map<OrgId, LibOrg> {
	const index: Map<OrgId, LibOrg> = new Map();

	for (const [libId, data] of libraries) {
		const orgId = data?.isPartOf?.[JsonLd.ID];
		if (!orgId) continue;

		if (!index.has(orgId)) {
			const org = orgs.get(orgId);
			if (org) {
				index.set(orgId, { ...org, _members: [] });
			}
		}
		index.get(orgId)!._members?.push(libId);
	}
	return index;
}

export function getAllLibraries() {
	return librariesCache ?? [];
}

export function getLibrary(id: string) {
	return librariesCache.get(id) ?? null;
}

export function getOrg(id: string) {
	return orgCache.get(id) ?? null;
}

export function getOrgMembers(id: OrgId): LibraryId[] | [] {
	return getOrg(id)?._members || [];
}

export async function refreshLibraries(displayUtil: DisplayUtil, locale: LocaleCode) {
	const libraries = await fetchLibraries(displayUtil, locale);
	const orgs = await fetchLibOrgs();

	librariesCache = libraries;
	orgCache = buildOrgIndex(libraries, orgs);
}

export async function startRefreshLibraries(displayUtil: DisplayUtil, locale: LocaleCode) {
	if (intervalStarted) return; // avoid multiple intervals
	intervalStarted = true;

	refreshLibraries(displayUtil, locale).catch((err) =>
		console.error('Initial library fetch failed:', err)
	);

	setInterval(() => {
		refreshLibraries(displayUtil, locale).catch((err) =>
			console.error('Scheduled library refresh failed:', err)
		);
	}, REFRESH_INTERVAL).unref();
}
