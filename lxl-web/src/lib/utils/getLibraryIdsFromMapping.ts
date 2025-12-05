import type { LibraryId, OrgId } from '$lib/types/holdings';
import type { DisplayMapping } from '$lib/types/search';
import { JsonLd } from '$lib/types/xl';

/**
 * accepts an array of DisplayMappings (search and subset)
 * and returns id:s and labels of libs/orgs that exist in user's search refinement
 */
export function getLibraryIdsFromMapping(
	mappings: (DisplayMapping[] | undefined)[]
): Record<LibraryId | OrgId, string> | null {
	const result: Record<string, string> = {};
	const validKeys = new Set(['itemHeldBy', 'itemHeldByOrg']);
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
			return;
		}

		if (mapping._key && validKeys.has(mapping._key)) {
			const id = mapping.display[JsonLd.ID];
			// as long as we don't fetch & cache library organizations
			// we need to store the labels for reuse too
			if (id) {
				result[id] = mapping.displayStr || '';
			}
		}
	}
	return Object.keys(result).length > 0 ? result : null;
}
