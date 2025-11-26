import { env } from '$env/dynamic/private';
import { JsonLd } from '$lib/types/xl';
import { gunzipSync } from 'node:zlib';

type Data = {
	[JsonLd.CONTEXT]: string[];
	[JsonLd.GRAPH]?: Record[] | Library[];
}[];

type Record = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	mainEntity: {
		[JsonLd.ID]: string;
	};
};

type Library = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
};

type FramedLibrary = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	mainEntity: Library;
};

let librariesCache: Map<string, FramedLibrary> = new Map();
let cacheExpires = 0;
const timeToLive = 24 * 60 * 1000; // 24h

async function fetchLibraries() {
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
	const libraryMap = new Map(libraryArr.map((lib) => [lib[JsonLd.ID], lib]));

	const end = Date.now();
	console.log(`Fetching all libraries took ${(end - start).toFixed(1)} ms`);
	return libraryMap;
}

function buildData(data: Data) {
	const libraries: FramedLibrary[] = [];

	for (const lib of data) {
		const graph = lib?.[JsonLd.GRAPH];
		if (!graph) continue;

		let record: Record | null = null;
		let mainEntity = null;

		for (const item of graph) {
			const type = item[JsonLd.TYPE];
			if (type === 'Record') {
				record = item as Record;
			} else if (type === 'Library') {
				mainEntity = item as Library;
			}
		}

		if (record && mainEntity) {
			// imitate "framed" data
			libraries.push({
				...record,
				mainEntity
			});
		}
	}
	return libraries;
}

export function getAllLibraries() {
	const now = Date.now();

	if (librariesCache && now < cacheExpires) {
		console.log('return the cache');
		return librariesCache;
	}

	// cache expired, refresh libs in background & return stale data meanwhile
	refreshLibraries();
	return librariesCache ?? [];
}

export function getLibrary(id: string) {
	return librariesCache.get(id) || null;
}

export async function refreshLibraries() {
	try {
		const libraries = await fetchLibraries();
		librariesCache = libraries;
		cacheExpires = Date.now() + timeToLive;
	} catch (error) {
		console.error('Refreshing Libraries failed', error);
	}
}
