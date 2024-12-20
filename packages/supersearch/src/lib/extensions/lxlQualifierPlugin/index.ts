import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import { EditorState, type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { mount } from 'svelte';
import QualifierComponent from './QualifierComponent.svelte';
import insertQuotes from './insertQuotes.js';
import { messages } from '$lib/constants/messages.js';

export type Qualifier = {
	key: string;
	value: string | undefined;
	operator: string;
};

export type GetLabelFunction = (
	key: string,
	value?: string
) => {
	keyLabel?: string;
	valueLabel?: string;
	removeLink?: string;
};

class QualifierWidget extends WidgetType {
	constructor(
		readonly key: string,
		readonly keyLabel: string | undefined,
		readonly keyType: string | undefined,
		readonly value: string | undefined,
		readonly valueLabel: string | undefined,
		readonly operator: string,
		readonly operatorType: string | undefined,
		readonly removeLink: string | undefined,
		readonly atomic: boolean
	) {
		super();
	}
	eq(other: QualifierWidget): boolean {
		return (
			this.key === other.key &&
			this.keyLabel === other.keyLabel &&
			this.operator === other.operator &&
			this.value === other.value &&
			this.valueLabel === other.valueLabel
		);
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.style.cssText = `position: relative; display:inline-flex`;
		mount(QualifierComponent, {
			props: {
				key: this.key,
				keyLabel: this.keyLabel,
				keyType: this.keyType,
				value: this.value,
				valueLabel: this.valueLabel,
				operator: this.operator,
				operatorType: this.operatorType,
				removeLink: this.removeLink
			},
			target: container
		});
		return container;
	}
}

function lxlQualifierPlugin(getLabelFn?: GetLabelFunction) {
	function getQualifiers(view: EditorView) {
		const widgets: Range<Decoration>[] = [];
		const doc = view.state.doc.toString();

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.name === 'Qualifier') {
						const keyNode = node.node.getChild('QualifierKey');
						const key = keyNode ? doc.slice(keyNode?.from, keyNode?.to) : '';
						const keyType = keyNode?.firstChild?.type.name;

						const operatorNode = node.node.getChild('QualifierOperator');
						const operator = operatorNode ? doc.slice(operatorNode?.from, operatorNode?.to) : '';
						const operatorType = operatorNode?.firstChild?.type.name;

						const valueNode = node.node.getChild('QualifierValue');
						const value = valueNode ? doc.slice(valueNode?.from, valueNode?.to) : undefined;

						const { keyLabel, valueLabel, removeLink } = getLabelFn?.(key, value) || {};

						// Add qualifier widget
						if (keyLabel) {
							const qualifierDecoration = Decoration.replace({
								widget: new QualifierWidget(
									key,
									keyLabel,
									keyType,
									value,
									valueLabel,
									operator,
									operatorType,
									removeLink,
									true // atomic
								)
							});
							const decorationRangeFrom = node.from;
							const decorationRangeTo = valueLabel ? node.to : operatorNode?.to;
							widgets.push(qualifierDecoration.range(decorationRangeFrom, decorationRangeTo));
						} else {
							// Add invalid key mark decoration
							const qualifierMark = Decoration.mark({
								class: 'invalid',
								inclusive: true,
								atomic: false
							});
							const invalidRangeFrom = keyNode ? keyNode.from : node.from;
							const invalidRangeTo = keyNode ? keyNode.to : operatorNode?.from;

							widgets.push(qualifierMark.range(invalidRangeFrom, invalidRangeTo));
						}
					}
				}
			});
		}
		return Decoration.set(widgets, true); // true = sort
	}

	/**
	 * filter out non-atomics using custom property 'atomic'
	 */
	const filterAtomic = (from: number, to: number, decoration: Decoration) => {
		return decoration.spec?.atomic || decoration.spec?.widget?.atomic;
	};

	// let _v = null;

	const qualifierPlugin = ViewPlugin.fromClass(
		class {
			qualifiers: DecorationSet;
			// atoms: readonly RangeSet<any>[]
			constructor(view: EditorView) {
				this.qualifiers = getQualifiers(view);
				// this.atoms = null;
			}

			update(update: ViewUpdate) {
				// console.log(this.qualifiers);
				if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
					// TODO: Calling getQualifiers on every document change is probably not good for performance
					// Try optimizing; either run the function only on certain kinds of input, or split getQualifiers;
					// one that updates the widgets (on input) and one that looks for labels (on data update)
					this.qualifiers = getQualifiers(update.view);
					// this.atoms = update.view.state.facet(EditorView.atomicRanges).map(f => f(update.view))
					// console.log(this.qualifiers);
				} else {
					for (const tr of update.transactions) {
						for (const e of tr.effects) {
							if (e.value.message === messages.NEW_DATA) {
								this.qualifiers = getQualifiers(update.view);
							}
						}
					}
				}
			}
		},
		{
			decorations: (instance) => instance.qualifiers,
			eventHandlers: {},
			provide: (plugin) => [
				EditorView.atomicRanges.of((view) => {
					// _v = view;
					const filteredRanges = view.plugin(plugin)?.qualifiers.update({ filter: filterAtomic });
					return filteredRanges || Decoration.none;
				}),
				EditorView.inputHandler.of((view, from, to, text, insert) => {
					console.log(from, to, text, view, insert);
					return false;
				}),
				// EditorView.updatelistener.of
				EditorState.transactionFilter.of(insertQuotes)
				// EditorState.transactionFilter.of((tr) => {
				// 	if (!tr.docChanged || (tr.isUserEvent('delete') && tr.state.selection.main.head === 0)) {
				// 		return tr;
				// 	} else {
				// 		// console.log(tr.isUserEvent('input'))
				// 		let found = false;
				// 		const changes =
				// 			{
				// 				changes: {
				// 					from: tr.state.selection.main.head,
				// 					to: tr.state.selection.main.head,
				// 					insert: ' '
				// 				},
				// 				sequential: true,
				// 				selection: { anchor: tr.state.selection.main.head }
				// 			};
				// 		const atoms = tr.state.facet(EditorView.atomicRanges).map(f => f(_v))
				// 		for (const set of atoms) {
				// 			set.between(0, tr.state.doc.length, (from, to, value) => {
				// 				// console.log(from, to, value)
				// 				// console.log(tr.startState.selection.main.head)
				// 				if (tr.startState.selection.main.head === from) {
				// 					// console.log('eureka!')
				// 					found = true;
				// 					return false;

				// 				}
				// 				// return true;
				// 			})
				// 		}
				// 		return found ? [tr, changes] : tr;
				// 	}
				// })
			]
		}
	);
	return qualifierPlugin;
}

export default lxlQualifierPlugin;
