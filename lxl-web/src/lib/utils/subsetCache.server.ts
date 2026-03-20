import { env } from '$env/dynamic/private';
import type { DisplayMapping, MappingsOnlyPartialCollectionView } from '$lib/types/search';
import { getTranslator } from '$lib/i18n';
import { getSupportedLocale } from '$lib/i18n/locales';
import { displayMappings } from './search';

const cache = new Map<string, DisplayMapping[]>();
const pending = new Map<string, Promise<MappingsOnlyPartialCollectionView | null>>();
const MAX_SIZE = 500;

function deleteOldest() {
	if (cache.size <= MAX_SIZE) return;
	// delete oldest entry if exceding max size
	const first = cache.keys().next().value;
	if (first) cache.delete(first);
}

async function fetchMapping(r: string) {
	const res = await fetch(
		`${env.API_URL}/find.jsonld?${new URLSearchParams({
			_r: r,
			_q: '',
			_mappingOnly: 'true'
		}).toString()}`
	);

	if (!res.ok) {
		console.warn('Failed to get _r mappings');
		return null;
	}

	return (await res.json()) as MappingsOnlyPartialCollectionView;
}

export async function getSubsetMapping(r: string | null, locals: App.Locals, lang: string) {
	if (!r || r === '*') {
		return undefined;
	}

	const cached = cache.get(r);
	if (cached) {
		return cached;
	}

	// deduplicate concurrent fetches
	let dataPromise = pending.get(r);
	if (!dataPromise) {
		dataPromise = fetchMapping(r).finally(() => pending.delete(r));
		pending.set(r, dataPromise);
	}

	const data = await dataPromise;

	if (data) {
		deleteOldest();
		const rMapping = await formatMapping(data, locals, lang);
		cache.set(r, rMapping);
		return rMapping;
	} else {
		return undefined;
	}
}

async function formatMapping(
	data: MappingsOnlyPartialCollectionView,
	locals: App.Locals,
	lang: string
): Promise<DisplayMapping[]> {
	const locale = getSupportedLocale(lang);
	const translator = await getTranslator(locale);
	const mappings = displayMappings(data, locals.display, locale, translator);
	return mappings.filter((m) => m.variable === '_r');
}
