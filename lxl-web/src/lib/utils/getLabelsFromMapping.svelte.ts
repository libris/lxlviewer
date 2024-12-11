import type { DisplayMapping } from '$lib/types/search';

let prevSuggestMapping: DisplayMapping[] | undefined;

function getLabelFromMappings(
	key: string,
	value?: string,
	pageMapping?: DisplayMapping[],
	suggestMapping?: DisplayMapping[]
) {
	const pageLabels = iterateMapping(key, value, pageMapping);
	const suggestLabels = iterateMapping(key, value, suggestMapping || prevSuggestMapping);

	const keyLabel = suggestLabels.keyLabel || pageLabels.keyLabel;
	const valueLabel = suggestLabels.valueLabel || pageLabels.valueLabel;
	// only page data have 'up' links we can use
	const removeLink = pageLabels.keyLabel ? pageLabels.removeLink : undefined;

	if (suggestMapping) {
		// TODO remove when invalid qualifier no longer result in empty error response
		// until when we need to save latest 'successful' suggest mapping
		prevSuggestMapping = suggestMapping;
	}

	return { keyLabel, valueLabel, removeLink };
}

function iterateMapping(
	key: string,
	value: string | undefined,
	mapping: DisplayMapping[] | undefined | null
) {
	let keyLabel: string | undefined;
	let valueLabel: string | undefined;
	let removeLink: string | undefined;

	if (mapping && Array.isArray(mapping)) {
		_iterate(mapping);

		function _iterate(m: DisplayMapping[]) {
			m.forEach((el) => {
				if (el.children) {
					_iterate(el.children);
				} else if (el.property === key) {
					keyLabel = el.label;
					const isLinked = !!el.display?.['@id'];
					// only use atomic ranges for linked values
					if (isLinked && el.displayStr) {
						valueLabel = el.displayStr;
					}
					removeLink = el.up?.['@id'];
				}
			});
		}
	}
	return { keyLabel, valueLabel, removeLink };
}

export default getLabelFromMappings;
