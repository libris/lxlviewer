import { env } from '$env/dynamic/private';
import { JsonLd, type VocabData } from '$lib/types/xl';
import { gunzipSync } from 'node:zlib';

let librariesCache: unknown[] | null = null;
let cacheExpires = 0;
const timeToLive = 24 * 60 * 1000; // 24h

async function fetchLibraries() {
	const start = Date.now();

	const res = await fetch(
		`${env.API_URL}/api/emm/full?selection=type:Library&download=.ndjsonld.gz`
	);
	const gzipped = Buffer.from(await res.arrayBuffer());
	const text = gunzipSync(gzipped).toString('utf8');
	const data: VocabData[] = text
		.trim()
		.split('\n')
		.map((line) => JSON.parse(line));

	const libraries = data
		.flatMap((lib) => {
			const taget = lib?.[JsonLd.GRAPH]?.filter((item) => item[JsonLd.TYPE] === 'Library');
			return taget;
		})
		.filter((lib) => !!lib);

	const end = Date.now();
	console.log(`Fetching all holders took ${(end - start).toFixed(1)} ms`);
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

export async function refreshLibraries() {
	try {
		const libraries = await fetchLibraries();
		librariesCache = libraries;
		cacheExpires = Date.now() + timeToLive;
	} catch (error) {
		console.error('Refreshing Libraries failed', error);
	}
}
