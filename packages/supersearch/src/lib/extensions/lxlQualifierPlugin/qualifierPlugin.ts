import { ViewPlugin, EditorView, type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { qualifierValidatorFacet } from './qualifierFacet.js';
import type { StateEffect } from '@codemirror/state';
import { messages } from '$lib/constants/messages.js';
import { sendMessage } from '$lib/utils/sendMessage.js';
import {
	qualifierSemanticField,
	setQualifierSemantic,
	type QualifierSemantic
} from './qualifierValidation.js';

export const qualifierPlugin = ViewPlugin.fromClass(
	class {
		update(update: ViewUpdate) {
			let shouldRevalidate = update.docChanged;

			if (!shouldRevalidate) {
				for (const tr of update.transactions) {
					for (const e of tr.effects) {
						if (e.is(sendMessage) && e.value.message === messages.NEW_DATA) {
							shouldRevalidate = true;
						}
					}
				}
			}

			if (shouldRevalidate) {
				this.schedule(update.view);
			}
		}
		private scheduled = false;

		schedule(view: EditorView) {
			if (this.scheduled) return;
			this.scheduled = true;

			queueMicrotask(() => {
				this.scheduled = false;
				this.runValidation(view);
			});
		}
		runValidation(view: EditorView) {
			const validator = view.state.facet(qualifierValidatorFacet);
			if (!validator) return;

			const current = view.state.field(qualifierSemanticField).data;
			const effects: StateEffect<unknown>[] = [];

			syntaxTree(view.state).iterate({
				enter: (node) => {
					if (node.name !== 'Qualifier') return;

					const semantic: QualifierSemantic = computeQualifierSemantic(node, view, validator);
					const key = `${node.from}-${node.to}`;

					if (!shallowEqual(current.get(key), semantic)) {
						effects.push(
							setQualifierSemantic.of({
								from: node.from,
								to: node.to,
								semantic
							})
						);
					}
				}
			});

			if (effects.length) {
				view.dispatch({ effects });
			}
		}
	}
);

function shallowEqual(a: QualifierSemantic | undefined, b: QualifierSemantic): boolean {
	if (a === b) return true;
	if (!a) return false;

	return (
		a.invalid === b.invalid &&
		a.keyLabel === b.keyLabel &&
		a.valueLabel === b.valueLabel &&
		a.removeLink === b.removeLink &&
		a.atomicFrom === b.atomicFrom &&
		a.atomicTo === b.atomicTo
	);
}

function computeQualifierSemantic(
	node: unknown,
	view: EditorView,
	validate: (
		key: string,
		value?: string
	) => {
		keyLabel?: string;
		valueLabel?: string;
		removeLink?: string;
		invalid: boolean;
	}
) {
	const treeNode = node.node;

	const keyNode = treeNode.getChild('QualifierKey');
	const opNode = treeNode.getChild('QualifierOperator');
	const valueNode = treeNode.getChild('QualifierValue');

	const keyText = keyNode ? view.state.doc.sliceString(keyNode.from, keyNode.to) : '';

	const valueText = valueNode
		? view.state.doc.sliceString(valueNode.from, valueNode.to)
		: undefined;

	const semantic = validate(keyText, valueText);

	// Decide atomic extent
	const atomicFrom = node.from;
	const atomicTo = semantic.valueLabel ? node.to : (opNode?.to ?? node.to);

	return {
		...semantic,
		key: keyText,
		atomicFrom,
		atomicTo
	};
}
