import type { DisplayMapping } from '$lib/types/search';

let prevSuggestMapping: DisplayMapping[] | undefined;

function getLabelFromMappings(
	key: string,
	value?: string,
	pageMapping?: DisplayMapping[],
	suggestMapping?: DisplayMapping[]
) {
	const nonQuotedKey = key.replace(/^"(.*)"$/, '$1');
	const nonQuotedValue = value && value.replace(/^"(.*)"$/, '$1');
	const bestSuggestMapping = suggestMapping?.length ? suggestMapping : prevSuggestMapping;

	const pageLabels = iterateMapping(nonQuotedKey, nonQuotedValue, pageMapping);
	const suggestLabels = iterateMapping(nonQuotedKey, nonQuotedValue, bestSuggestMapping);

	const keyLabel = suggestLabels.keyLabel || pageLabels.keyLabel;
	const valueLabel = suggestLabels.valueLabel || pageLabels.valueLabel;
	const invalid = suggestLabels.invalid || pageLabels.invalid;

	if (suggestMapping?.length) {
		// save latest mapping as fallback for error responses etc
		prevSuggestMapping = suggestMapping;
	}

	return { keyLabel, valueLabel, invalid };
}

function iterateMapping(
	key: string,
	value: string | undefined,
	mapping: DisplayMapping[] | undefined | null
) {
	let keyLabel: string | undefined;
	let valueLabel: string | undefined;
	let invalid: boolean = false;

	if (mapping && Array.isArray(mapping)) {
		_iterate(mapping);

		function _iterate(m: DisplayMapping[]) {
			m.forEach((el) => {
				if (el.children) {
					_iterate(el.children);
				} else if (el?._key === key) {
					if (el?.invalid === el?._key) {
						invalid = true;
					} else {
						keyLabel = el.label;
					}
					const isLinked = !!el.display?.['@id'];
					if (isLinked && value === el?._value && el?.displayStr) {
						// only use atomic ranges for linked values
						valueLabel = el.displayStr;
					}
				}
			});
		}
	}
	return { keyLabel, valueLabel, invalid };
}

export default getLabelFromMappings;
