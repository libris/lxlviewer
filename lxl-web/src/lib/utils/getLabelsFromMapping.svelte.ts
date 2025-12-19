import type { DisplayMapping } from '$lib/types/search';

let prevSuggestMapping: DisplayMapping[] | undefined;

function getLabelFromMappings(
	key: string,
	value?: string,
	pageMapping?: DisplayMapping[],
	suggestMapping?: DisplayMapping[]
) {
	const bestSuggestMapping = suggestMapping?.length ? suggestMapping : prevSuggestMapping;

	const pageLabels = iterateMapping(key, value, pageMapping);
	const suggestLabels = iterateMapping(key, value, bestSuggestMapping);

	const keyLabel = suggestLabels.keyLabel || pageLabels.keyLabel;
	const valueLabel = suggestLabels.valueLabel || pageLabels.valueLabel;
	const invalid = suggestLabels.invalid || pageLabels.invalid;
	const removeLink = suggestLabels.removeLink || pageLabels.removeLink;

	if (suggestMapping?.length) {
		// save latest mapping as fallback for error responses etc
		prevSuggestMapping = suggestMapping;
	}

	return { key, value, keyLabel, valueLabel, removeLink, invalid };
}

function iterateMapping(
	key: string,
	value: string | undefined,
	mapping: DisplayMapping[] | undefined | null
) {
	let keyLabel: string | undefined;
	let valueLabel: string | undefined;
	let removeLink: string | undefined;
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
						removeLink = el.up?.['@id'];
					}
				} else if (!key && value === el?._value && el?.displayStr) {
					// ...unless a filter alias (no key, only value)
					valueLabel = el.displayStr;
					removeLink = el.up?.['@id'];
				}
			});
		}
	}
	return { keyLabel, valueLabel, removeLink, invalid };
}

export default getLabelFromMappings;
