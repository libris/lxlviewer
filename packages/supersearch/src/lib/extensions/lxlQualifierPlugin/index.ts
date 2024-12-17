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

	const qualifierPlugin = ViewPlugin.fromClass(
		class {
			qualifiers: DecorationSet;
			constructor(view: EditorView) {
				this.qualifiers = getQualifiers(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
					// let's see how it works to run getQualifiers only on new data and not on input
					// should be much better for performande...
					// this.qualifiers = getQualifiers(update.view);
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
					const filteredRanges = view.plugin(plugin)?.qualifiers.update({ filter: filterAtomic });
					return filteredRanges || Decoration.none;
				}),
				EditorState.transactionFilter.of(insertQuotes)
			]
		}
	);
	return qualifierPlugin;
}

export default lxlQualifierPlugin;
