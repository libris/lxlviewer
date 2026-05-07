import type { DisplayMapping, QualifierSuggestion2 } from '$lib/types/search';
import { JsonLd } from '$lib/types/xl';

let prevSuggestMapping: DisplayMapping[] | undefined;

function getLabelFromMappings(
	key: string,
	value?: string,
	pageMapping?: DisplayMapping[],
	suggestMapping?: DisplayMapping[],
	qualifierSuggestions?: QualifierSuggestion2[]
) {
	const bestSuggestMapping = suggestMapping?.length ? suggestMapping : prevSuggestMapping;

	// need a key label only - look in the cached list
	if (qualifierSuggestions && key && (!value || value === '()')) {
		let keyLabel = getKeyLabelFromList(key, qualifierSuggestions);
		if (keyLabel) {
			keyLabel = keyLabel.charAt(0).toUpperCase() + keyLabel.slice(1);
			return { key, keyLabel, invalid: false, isRedundantKeyLabel: false };
		}
	}
	const pageLabels = iterateMapping(key, value, pageMapping);
	const suggestLabels = iterateMapping(key, value, bestSuggestMapping);

	const keyLabel = suggestLabels.keyLabel || pageLabels.keyLabel;
	const valueLabel = suggestLabels.valueLabel || pageLabels.valueLabel;
	let invalid = suggestLabels.invalid !== false && pageLabels.invalid !== false;
	const removeLink = suggestLabels.removeLink || pageLabels.removeLink;
	const type = suggestLabels.type || pageLabels.type;
	const id = suggestLabels.id || pageLabels.id;
	const isRedundantKeyLabel = pageLabels?.isRedundantKeyLabel || suggestLabels?.isRedundantKeyLabel;

	if (suggestMapping?.length) {
		// save latest mapping as fallback for error responses etc
		prevSuggestMapping = suggestMapping;
	}

	// display labels - valid?
	if (keyLabel || valueLabel) {
		invalid = false;
	}

	return { key, value, keyLabel, valueLabel, removeLink, invalid, type, id, isRedundantKeyLabel };
}

function iterateMapping(
	key: string,
	value: string | undefined,
	mapping: DisplayMapping[] | undefined | null
) {
	let keyLabel: string | undefined;
	let valueLabel: string | undefined;
	let removeLink: string | undefined;
	let invalid: boolean | undefined;
	let type: string | undefined;
	let id: string | undefined;
	let isRedundantKeyLabel: boolean | undefined;

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
						invalid = false;
						keyLabel = el.label;
					}
					const isLinked = !!el.display?.[JsonLd.ID];
					const valueWithoutWrappingParens = value?.trim().match(/^[(].*[)]$/)
						? value?.trim().replace(/^[(]/, '').replace(/[)]$/, '')
						: value;
					if (isLinked && valueWithoutWrappingParens === el?._value && el?.displayStr) {
						// only use atomic ranges for linked values
						valueLabel = el.displayStr;
						removeLink = el.up?.[JsonLd.ID];
						type = el?.display?.[JsonLd.TYPE];
						if (type === 'Person') {
							id = el?.display?.[JsonLd.ID];
						}
					}
					isRedundantKeyLabel = el.isRedundantKeyLabel;
				} else if (!key && value === el?._value && el?.displayStr) {
					// ...unless a filter alias (no key, only value)
					valueLabel = el.displayStr;
					removeLink = el.up?.['@id'];
				}
			});
		}
	}
	return { keyLabel, valueLabel, removeLink, invalid, type, id, isRedundantKeyLabel };
}

function getKeyLabelFromList(key: string, suggestion: QualifierSuggestion2[]) {
	const match = suggestion.find((s) => s.key === key || s.queryCodes.includes(key));
	return match?.label ?? null;
}

export default getLabelFromMappings;
