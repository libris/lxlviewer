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
	const bestSuggestMapping = $derived(suggestMapping?.length ? suggestMapping : prevSuggestMapping);

	const pageLabels = iterateMapping(nonQuotedKey, nonQuotedValue, pageMapping);
	const suggestLabels = iterateMapping(nonQuotedKey, nonQuotedValue, bestSuggestMapping);

	const keyLabel = suggestLabels.keyLabel || pageLabels.keyLabel;
	const valueLabel = suggestLabels.valueLabel || pageLabels.valueLabel;
	const invalid = suggestLabels.invalid || pageLabels.invalid;
	// only page data have 'up' links we can use
	const removeLink = pageLabels.keyLabel ? pageLabels.removeLink : undefined;

	if (suggestMapping?.length) {
		// save latest ok labels if we should get an (empty) error response
		prevSuggestMapping = suggestMapping;
	}

	return { keyLabel, valueLabel, removeLink, invalid };
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
						// only show remove btn for pills that can't be edited
						removeLink = el.up?.['@id'];
					}
				}
			});
		}
	}
	return { keyLabel, valueLabel, removeLink, invalid };
}

export default getLabelFromMappings;
