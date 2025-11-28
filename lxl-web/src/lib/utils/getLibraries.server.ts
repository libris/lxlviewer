import { env } from '$env/dynamic/private';
import type { LibraryFull, LibraryId, LibraryWithLinks } from '$lib/types/holdings';
import { BibDb, JsonLd } from '$lib/types/xl';
import { gunzipSync } from 'node:zlib';
import { createHolderLinks } from './holdings.server';
import type { DisplayUtil } from './xl';
import type { LocaleCode } from '$lib/i18n/locales';

type Data = {
	[JsonLd.CONTEXT]: string[];
	[JsonLd.GRAPH]?: Record[] | LibraryFull[];
}[];

type Record = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	mainEntity: {
		[JsonLd.ID]: string;
	};
};

let librariesCache: Map<LibraryId, LibraryWithLinks> = new Map();
let cacheExpires = 0;
const timeToLive = 24 * 60 * 1000; // 24h

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
	console.log(lib);
	const links = createHolderLinks(lib, locale, displayUtil);
	const library = { ...lib, ...links };
	delete library[BibDb.address];

	return library;
}

function buildData(data: Data) {
	const libraries: LibraryFull[] = [];

	for (const lib of data) {
		const graph = lib?.[JsonLd.GRAPH];
		if (!graph) continue;

		let library: LibraryFull | null = null;

		for (const item of graph) {
			const type = item[JsonLd.TYPE];
			if (type === 'Library') {
				library = item as LibraryFull;
			}
		}

		if (library) {
			libraries.push(library);
		}
	}
	return libraries;
}

export function getAllLibraries(displayutil: DisplayUtil, locale: LocaleCode) {
	const now = Date.now();

	if (librariesCache && now < cacheExpires) {
		console.log('return the cache');
		return librariesCache;
	}

	// cache expired, refresh libs in background & return stale data meanwhile
	refreshLibraries(displayutil, locale);
	return librariesCache ?? [];
}

export function getLibrary(id: string) {
	return librariesCache.get(id) ?? null;
}

export async function refreshLibraries(displayUtil: DisplayUtil, locale: LocaleCode) {
	try {
		const libraries = await fetchLibraries(displayUtil, locale);
		librariesCache = libraries;
		cacheExpires = Date.now() + timeToLive;
	} catch (error) {
		console.error('Refreshing Libraries failed', error);
	}
}
