import type { DisplayMapping } from '$lib/utils/search';

export function shouldShowMapping(mapping: DisplayMapping[]) {
	if (mapping.length === 1 && mapping[0].display === '*' && mapping[0].operator === 'equals') {
		return false; // hide if only wildcard search
	}
	return true;
}
