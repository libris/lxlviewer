import { relativizeUrl, stripAnchor, trimSlashes } from '#lib/utils/http.js';
import { getContext, setContext } from 'svelte';

type Item = string;

function createSelection() {
	let selection = $state<Item[]>([]);

	return {
		get getAll() {
			return selection;
		},

		get hasSelection() {
			return selection.length ? true : false;
		},

		isSelected(id: string) {
			const fnurgel = normalize(id);
			return selection.some((i) => i === fnurgel);
		},

		toggle(id: Item) {
			const fnurgel = normalize(id);
			if (selection.some((i) => i === fnurgel)) {
				selection = selection.filter((i) => i !== fnurgel);
			} else if (fnurgel) {
				selection.push(fnurgel);
			}
		},

		clear() {
			selection = [];
		}
	};
}

function normalize(id: string) {
	return stripAnchor(trimSlashes(relativizeUrl(id))) || '';
}

const selectionKey = Symbol('selection');

export function setSelectionContext() {
	return setContext(selectionKey, createSelection());
}

export function getSelectionContext() {
	return getContext<ReturnType<typeof createSelection>>(selectionKey);
}
