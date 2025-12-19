import { ViewPlugin, EditorView, type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { qualifierValidatorFacet } from './qualifierFacet.js';
import type { StateEffect } from '@codemirror/state';
import { messages } from '$lib/constants/messages.js';
import { sendMessage } from '$lib/utils/sendMessage.js';
import { qualifierSemanticField, setQualifierSemantic } from './qualifierValidation.js';

export const qualifierPlugin = ViewPlugin.fromClass(
	class {
		private scheduled = false;

		constructor(view: EditorView) {
			this.schedule(view);
		}

		update(update: ViewUpdate) {
			let shouldRevalidate = update.docChanged;

			if (!update.docChanged) {
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

		schedule(view: EditorView) {
			if (this.scheduled) return;
			this.scheduled = true;

			queueMicrotask(() => {
				this.scheduled = false;
				this.validate(view);
			});
		}

		validate(view: EditorView) {
			// const validator = view.state.facet(qualifierValidatorFacet)
			// if (!validator) return;

			// const effects: StateEffect<any>[] = [];

			const validator = view.state.facet(qualifierValidatorFacet);
			if (!validator) return;

			const current = view.state.field(qualifierSemanticField);
			const effects: StateEffect<unknown>[] = [];

			syntaxTree(view.state).iterate({
				enter: (node) => {
					if (node.name !== 'Qualifier') return;
					const qualifierKey = node.node.getChild('QualifierKey');
					// TODO enum for these
					const qualifierValue = node.node.getChild('QualifierValue');

					const qualifierKeyText = qualifierKey
						? view.state.doc.sliceString(qualifierKey.from, qualifierKey.to)
						: '';
					const qualifierValueText = qualifierValue
						? view.state.doc.sliceString(qualifierValue.from, qualifierValue.to)
						: undefined;

					const semantic = validator(qualifierKeyText, qualifierValueText);
					const key = `${node.from}-${node.to}`;

					if (current.get(key) !== semantic) {
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
