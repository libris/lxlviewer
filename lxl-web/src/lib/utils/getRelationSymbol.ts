import type { SearchOperators } from '$lib/types/search';

export function getRelationSymbol(operator: keyof typeof SearchOperators): string {
	switch (operator) {
		case 'equals':
		case 'existence':
			return ':';
		case 'not':
			return '≠';
		case 'greaterThan':
			return '＞';
		case 'greaterThanOrEquals':
			return '⩾';
		case 'lessThan':
			return '＜';
		case 'lessThanOrEquals':
			return '⩽';
		case 'notExistence':
			return '∄';
		default:
			return '';
	}
}
