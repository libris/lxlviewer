import type { DisplayMapping } from '$lib/types/search';
import { getRelationSymbol } from './getRelationSymbol';

export function displayMappingToString(mapping: DisplayMapping[]): string {
	if (mapping) {
		const result: string[] = [];
		mapping.forEach((m) => _iterate(m));

		function _iterate(mapping: DisplayMapping) {
			const { children, operator, variable, displayStr, label } = mapping;
			if (displayStr) {
				result.push(`${label}${getRelationSymbol(operator)} ${displayStr}`);
			} else if (children) {
				if (!variable) {
					result.push('(');
				}
				children.forEach((m, i) => {
					_iterate(m);
					if (i === 0) {
						result.push(getBoolean(operator));
					}
				});
				if (!variable) {
					result.push(')');
				}
			}
		}
		return result.join('').trim();
	}
	return '';
}

function getBoolean(operator: string) {
	switch (operator) {
		case 'and':
			return ', ';
		default:
			return ` ${operator.toUpperCase()} `;
	}
}
