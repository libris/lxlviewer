import { MAPPING_IGNORE_VARIABLE } from '$lib/constants/mapping';
import type { DisplayMapping } from '$lib/types/search';

export function displayMappingToString(mapping: DisplayMapping[]): string {
	if (mapping) {
		const result: string[] = [];
		mapping.forEach((m) => _iterate(m));

		function _iterate(mapping: DisplayMapping) {
			if (MAPPING_IGNORE_VARIABLE.some((v) => v === mapping.variable)) return;
			const { children, operator, variable, displayStr, label, _key, _value } = mapping;
			if (displayStr || label) {
				if (!_key && !_value && displayStr) {
					// don't show 'free text search' label
					result.push(displayStr);
				} else {
					result.push(
						`${label || _key || ''}${operator !== 'none' ? ':' : ''} ${displayStr || _value}`
					);
				}
			} else if (children) {
				if (children.length > 1 && !variable) {
					result.push('(');
				}
				result.push(formatBooleanOperator(operator));
				children.forEach((m) => {
					_iterate(m);
				});
				if (children.length > 1 && !variable) {
					result.push(')');
				}
			}
		}
		return result
			.filter((m) => !!m)
			.join(' ')
			.trim();
	}
	return '';
}

function formatBooleanOperator(operator: string) {
	switch (operator) {
		case 'and':
		case 'none':
			return '';
		default:
			return ` ${operator.toUpperCase()} `;
	}
}
