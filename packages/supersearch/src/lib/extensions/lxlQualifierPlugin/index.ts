import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import { EditorState, Transaction, type Range, type TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { mount } from 'svelte';
import QualifierRemove from './QualifierRemove.svelte';
import QualifierKey from './QualifierKey.svelte';

export type Qualifier = {
	key: string;
	value: string | undefined;
	operator: string;
};

class RemoveWidget extends WidgetType {
	constructor(
		readonly range: { from: number; to: number },
		readonly atomic: boolean
	) {
		super();
	}
	eq(other: RemoveWidget) {
		return this.range.from === other.range.from && this.range.to === other.range.to;
	}
	// is there a way to pass new props to component instead of re-mounting every time range changes?
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierRemove, {
			props: {
				range: this.range
			},
			target: container
		});
		return container;
	}
}

class QualifierKeyWidget extends WidgetType {
	constructor(
		readonly key: string,
		readonly operator: string,
		readonly atomic: boolean
	) {
		super();
	}
	eq(other: QualifierKeyWidget): boolean {
		return this.key === other.key && this.operator === other.operator;
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierKey, {
			props: {
				key: this.key,
				operator: this.operator
			},
			target: container
		});
		return container;
	}
}

function getQualifiers(view: EditorView) {
	const widgets: Range<Decoration>[] = [];
	const doc = view.state.doc.toString();

	syntaxTree(view.state).iterate({
		enter: (node) => {
			if (node.name === 'Qualifier') {
				// Mark decoration to create wrapper element, non-atomic
				const qualifierMark = Decoration.mark({
					class: 'qualifier',
					inclusive: true,
					atomic: false // invented!
				});
				widgets.push(qualifierMark.range(node.from, node.to));

				// Remove decoration (x-button) widget - atomic
				const removeDecoration = Decoration.widget({
					widget: new RemoveWidget({ from: node.from, to: node.to }, true),
					side: 1
				});
				widgets.push(removeDecoration.range(node.to));

				// Qualifier key + operator widget - atomic
				const qKeyNode = node.node.getChild('QualifierKey');
				const qOperatorNode = node.node.getChild('QualifierOperator');
				const operator = doc.slice(qOperatorNode?.from, qOperatorNode?.to);
				const qKey = doc.slice(qKeyNode?.from, qKeyNode?.to);

				const qualifierKeyecoration = Decoration.replace({
					widget: new QualifierKeyWidget(qKey, operator, true)
				});
				if (qKeyNode) {
					widgets.push(qualifierKeyecoration.range(qKeyNode?.from, qOperatorNode?.to));
				}
			}
		}
	});
	return Decoration.set(widgets, true); // true = sort
}

/**
 * Moves cursor into an empty quote on falsy qualifier value
 */
const insertQuotes = (tr: Transaction) => {
	let foundEmptyQValue = false;
	const changes: TransactionSpec = {
		changes: {
			from: tr.state.selection.main.head,
			to: tr.state.selection.main.head,
			insert: '""'
		},
		sequential: true,
		selection: { anchor: tr.state.selection.main.head + 1 }
	};
	syntaxTree(tr.state).iterate({
		enter: (node) => {
			if (node.name === 'Qualifier') {
				const qValue = node.node.getChild('QualifierValue');
				if (!qValue) {
					foundEmptyQValue = true;
					return true;
				}
			}
		}
	});
	return foundEmptyQValue ? [tr, changes] : tr;
};

/**
 * filter out non-atomics using custom property 'atomic'
 */
const filterAtomic = (from: number, to: number, decoration: Decoration) => {
	return decoration.spec?.atomic || decoration.spec?.widget?.atomic;
};

export const lxlQualifierPlugin = ViewPlugin.fromClass(
	class {
		qualifiers: DecorationSet;
		constructor(view: EditorView) {
			this.qualifiers = getQualifiers(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
				this.qualifiers = getQualifiers(update.view);
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

export default lxlQualifierPlugin;
