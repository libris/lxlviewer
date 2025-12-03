import { env } from '$env/dynamic/private';
import type {
	LibraryFull,
	LibraryId,
	LibraryRecord,
	LibraryWithLinks,
	OrgId
} from '$lib/types/holdings';
import { BibDb, JsonLd } from '$lib/types/xl';
import { gunzipSync } from 'node:zlib';
import { createHolderLinks } from './holdings.server';
import type { DisplayUtil } from './xl';
import type { LocaleCode } from '$lib/i18n/locales';

type Data = {
	[JsonLd.CONTEXT]: string[];
	[JsonLd.GRAPH]?: LibraryRecord[] | LibraryFull[];
}[];

type LibrariesCache = Map<LibraryId, LibraryWithLinks>;
type OrgIndex = Map<OrgId, string[]>;

let librariesCache: LibrariesCache = new Map();
let orgIndex: OrgIndex = new Map();

async function fetchLibraries(displayUtil: DisplayUtil, locale: LocaleCode) {
	const start = Date.now();

	const res = await fetch(
		`${env.API_URL}/api/emm/full?selection=type:Library&download=.ndjsonld.gz`
	);
	const gzipped = Buffer.from(await res.arrayBuffer());
	const text = gunzipSync(gzipped).toString('utf8');
	const data: Data = text
		.trim()
		.split('\n')
		.map((line) => JSON.parse(line));

	const libraryArr = buildData(data);
	const libraryMap = new Map(
		libraryArr.map((lib) => [lib[JsonLd.ID], withLinks(lib, displayUtil, locale)])
	);

	const end = Date.now();
	console.log(`Fetching all libraries took ${(end - start).toFixed(1)} ms`);
	return libraryMap;
}

function withLinks(
	lib: LibraryFull,
	displayUtil: DisplayUtil,
	locale: LocaleCode
): LibraryWithLinks {
	const links = createHolderLinks(lib, locale, displayUtil);
	const library = { ...lib, ...{ _links: links } };
	delete library[BibDb.address];

	return library;
}

function buildData(data: Data) {
	const libraries: LibraryFull[] = [];

	for (const lib of data) {
		const graph = lib?.[JsonLd.GRAPH];
		if (!graph) continue;

		let record: LibraryRecord | null = null;
		let library: LibraryFull | null = null;

		for (const item of graph) {
			const type = item[JsonLd.TYPE];
			if (type === 'Record') {
				record = item as LibraryRecord;
			} else if (type === 'Library') {
				library = item as LibraryFull;
			}
		}

		if (record && library) {
			libraries.push({
				...library,
				meta: record
			});
		}
	}
	return libraries;
}

function buildOrgIndex(libraryMap: LibrariesCache): OrgIndex {
	const index: Map<OrgId, string[]> = new Map();

	for (const [libId, data] of libraryMap) {
		const orgId = data?.isPartOf?.[JsonLd.ID];
		if (!orgId) continue;

		if (!index.has(orgId)) {
			index.set(orgId, []);
		}
		index.get(orgId)!.push(libId);
	}
	return index;
}

export function getAllLibraries() {
	return librariesCache ?? [];
}

export function getLibrary(id: string) {
	return librariesCache.get(id) ?? null;
}

export function getOrgs() {
	return orgIndex ?? [];
}

export function getOrgMembers(id: OrgId): LibraryId[] | [] {
	return orgIndex.get(id) ?? [];
}

export async function refreshLibraries(displayUtil: DisplayUtil, locale: LocaleCode) {
	try {
		const libraries = await fetchLibraries(displayUtil, locale);
		librariesCache = libraries;
		orgIndex = buildOrgIndex(libraries);
	} catch (error) {
		console.error('Refreshing Libraries failed', error);
	}
}
