import type { DisplayMapping } from '$lib/types/search';

// accepts an array of DisplayMappings (search and subset)
// and returns a list of unique sigels that exist in user's search refinement
export function getSigelsFromMapping(mappings: (DisplayMapping[] | undefined)[]): string[] | [] {
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
		} else if (mapping._key === 'itemHeldBy' && mapping._value) {
			const sigel = mapping._value.split(':')[1]?.replace('"', '');
			if (sigel) result.push(sigel);
		}
	}
	return [...new Set(result)];
}
