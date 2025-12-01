import type { LibraryId } from '$lib/types/holdings';
import type { DisplayMapping } from '$lib/types/search';
import { JsonLd } from '$lib/types/xl';

/**
 * accepts an array of DisplayMappings (search and subset)
 * and returns a list of unique library id:s that exist in user's search refinement
 */
export function getLibraryIdsFromMapping(
	mappings: (DisplayMapping[] | undefined)[]
): LibraryId[] | [] {
	const result: string[] = [];
	for (const mapping of mappings) {
		if (mapping) {
			for (const m of mapping) {
				_iterate(m);
			}
		}
	}

	function _iterate(mapping: DisplayMapping) {
		if (mapping.operator !== 'not' && mapping.children) {
			for (const child of mapping.children) {
				_iterate(child);
			}
		} else if (mapping._key === 'itemHeldBy' && mapping.display) {
			result.push(mapping.display[JsonLd.ID]);
		}
	}
	return [...new Set(result)];
}
