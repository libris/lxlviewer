import { MAPPING_IGNORE_VARIABLE } from '$lib/constants/mapping';
import type { DisplayMapping } from '$lib/types/search';

export function displayMappingToString(mapping: DisplayMapping[]): string {
	if (!mapping) return '';

	function _iterate(mapping: DisplayMapping): string {
		if (MAPPING_IGNORE_VARIABLE.some((v) => v === mapping.variable)) return '';

		const { children, operator, variable, displayStr, label, _key, _value, isRedundantKeyLabel } =
			mapping;

		if (displayStr || label) {
			const isFreeText = !_key && !_value;

			let _op = '';
			switch (operator) {
				case 'none':
					break;
				case 'like':
					_op = '~';
					break;
				default:
					_op = ':';
					break;
			}

			if ((isFreeText || isRedundantKeyLabel) && displayStr) {
				return `${_op === '~' ? `${_op} ` : ''}${displayStr}`;
			}

			return `${label || _key || ''}${_op} ${displayStr || _value}`;
		}

		if (children) {
			const renderedChildren = children.map(_iterate).filter(Boolean);

			let result: string;

			if (operator === 'not') {
				result = `${operator.toUpperCase()} ${renderedChildren.join(' ')}`;
			} else {
				const separator = operator === 'or' ? ' OR ' : ' ';
				result = renderedChildren.join(separator);
			}

			if (children.length > 1 && !variable) {
				result = `(${result.trim()})`;
			}

			return result;
		}

		return '';
	}

	return mapping.map(_iterate).filter(Boolean).join(' ').trim();
}
