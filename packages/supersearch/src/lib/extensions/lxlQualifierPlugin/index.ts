import {
	Decoration,
	EditorView,
	ViewPlugin,
	type ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import {
	EditorState,
	RangeSet,
	RangeSetBuilder,
	type Range,
	type RangeValue
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { mount, type Component } from 'svelte';
import {
	jumpPastParens,
	handleInputBeforeGroup,
	createGhostGroup,
	removeGhostGroup,
	repairGhostGroup,
	balanceInnerParens
} from './ghostGroup.js';
import { messages } from '$lib/constants/messages.js';
import insertSpaceAroundQualifier from './insertSpaceAroundQualifier.js';

export type Qualifier = {
	key: string;
	value: string | undefined;
	operator: string;
};

export type QualifierWidgetProps = {
	key: string;
	keyLabel?: string;
	operator: string;
	value?: string;
	valueLabel?: string;
	removeLink?: string;
};

export type GetLabelFunction = (
	key: string,
	value?: string
) => {
	keyLabel?: string;
	valueLabel?: string;
	invalid?: boolean;
	removeLink?: string;
};

type QualifierWidgetComponent = Component<QualifierWidgetProps>;

class QualifierWidget extends WidgetType {
	constructor(
		readonly key: string,
		readonly keyLabel: string | undefined,
		readonly operator: string,
		readonly value: string | undefined,
		readonly valueLabel: string | undefined,
		readonly qualifierWidget: QualifierWidgetComponent,
		readonly removeLink: string | undefined
	) {
		super();
	}
	eq(other: QualifierWidget): boolean {
		return (
			this.key === other.key &&
			this.keyLabel === other.keyLabel &&
			this.operator === other.operator &&
			this.value === other.value &&
			this.valueLabel === other.valueLabel &&
			this.removeLink === other.removeLink
		);
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.className = 'atomic';
		mount(this.qualifierWidget, {
			props: {
				key: this.key,
				keyLabel: this.keyLabel,
				operator: this.operator,
				value: this.value,
				valueLabel: this.valueLabel,
				removeLink: this.removeLink
			},
			target: container
		});
		return container;
	}
}

class ghostGroupWidget extends WidgetType {
	eq(): boolean {
		return true;
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.classList.add('lxl-ghost-group');
		return container;
	}
}

function lxlQualifierPlugin(
	qualifierWidget?: QualifierWidgetComponent,
	getLabelFn?: GetLabelFunction
) {
	let atomicRangeSet: RangeSet<RangeValue> = RangeSet.empty;
	const SHOW_GHOST_GROUP = false;

	function getQualifiers(view: EditorView) {
		const widgets: Range<Decoration>[] = [];
		const ranges = new RangeSetBuilder();
		const doc = view.state.doc.toString();

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.name === 'UTerm' || node.name === 'QualifierUTerm') {
						const notMark = Decoration.mark({
							class: 'lxl-not-term',
							inclusive: true
						});
						widgets.push(notMark.range(node.from, node.to));
					} else if (node.name === 'Qualifier') {
						const keyNode = node.node.getChild('QualifierKey');
						const key = keyNode ? doc.slice(keyNode?.from, keyNode?.to) : '';

						const operatorNode = node.node.getChild('QualifierOperator');
						const operator = operatorNode ? doc.slice(operatorNode?.from, operatorNode?.to) : '';

						const valueNode = node.node.getChild('QualifierValue');
						const value = valueNode ? doc.slice(valueNode?.from, valueNode?.to) : undefined;

						// QUALIFIER VALIDATION

						const { keyLabel, valueLabel, removeLink, invalid } = getLabelFn?.(key, value) || {};

						if (keyLabel && !invalid) {
							// add qualfier mark
							const qualifierMark = Decoration.mark({
								class: 'lxl-qualifier',
								attributes: {
									style: 'display: inline-block; margin-left: 1px; margin-right: 1px;'
								},
								inclusive: true
							});
							widgets.push(qualifierMark.range(node.from, node.to));

							if (valueNode) {
								const ghostGroup = valueNode.getChild('QualifierOuterGroup');

								if (ghostGroup && !SHOW_GHOST_GROUP) {
									// add ghost parens mark
									const parensMark = Decoration.replace({
										widget: new ghostGroupWidget(),
										inclusive: false
									});

									const openingParens = ghostGroup.from;
									const closingParens = ghostGroup.to;

									if (
										doc.slice(openingParens, openingParens + 1) === '(' &&
										doc.slice(closingParens - 1, closingParens) === ')'
									) {
										widgets.push(parensMark.range(openingParens, openingParens + 1));
										widgets.push(parensMark.range(closingParens - 1, closingParens));
									}
								}
							}

							// Add qualifier widget
							if (qualifierWidget) {
								const qualifierDecoration = Decoration.replace({
									widget: new QualifierWidget(
										key,
										keyLabel,
										operator,
										value,
										valueLabel,
										qualifierWidget,
										removeLink
									)
								});
								const decorationRangeFrom = node.from;
								const decorationRangeTo = valueLabel ? node.to : operatorNode?.to;

								ranges.add(decorationRangeFrom, decorationRangeTo || node.to, qualifierDecoration);
								widgets.push(qualifierDecoration.range(decorationRangeFrom, decorationRangeTo));
							}
						} else if (invalid) {
							// Add invalid key mark decoration
							// const invalidKey = Decoration.mark({
							// 	class: 'lxl-invalid',
							// 	inclusive: false
							// });
							// const invalidRangeFrom = keyNode ? keyNode.from : node.from;
							// const invalidRangeTo = keyNode ? keyNode.to : operatorNode?.from;
							// widgets.push(invalidKey.range(invalidRangeFrom, invalidRangeTo));
						}
					}
				}
			});
		}
		atomicRangeSet = ranges.finish();

		return Decoration.set(widgets, true);
	}

	class LxlQualifier {
		qualifiers: DecorationSet;
		constructor(view: EditorView) {
			this.qualifiers = getQualifiers(view);
		}
		update(update: ViewUpdate) {
			if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
				// TODO: Calling getQualifiers on every document change is probably not good for performance
				// Try optimizing; either run the function only on certain kinds of input, or split getQualifiers;
				// one that updates the widgets (on input) and one that looks for labels (on data update)
				this.qualifiers = getQualifiers(update.view);
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
	}

	const plugin = ViewPlugin.fromClass(LxlQualifier, {
		decorations: (instance) => instance.qualifiers,
		provide: () => [
			EditorView.atomicRanges.of(() => atomicRangeSet),
			// ghost group filters -->
			EditorState.transactionFilter.of(jumpPastParens),
			// EditorState.transactionFilter.of(createGhostGroup),
			createGhostGroup(() => atomicRangeSet),
			EditorState.transactionFilter.of(handleInputBeforeGroup),
			EditorState.transactionFilter.of(removeGhostGroup),
			EditorState.transactionFilter.of(repairGhostGroup),
			EditorState.transactionFilter.of(balanceInnerParens),
			// <--
			insertSpaceAroundQualifier(() => atomicRangeSet)
		]
	});

	return plugin;
}

export default lxlQualifierPlugin;
