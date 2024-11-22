import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import { Annotation, EditorState, Transaction, type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { mount } from 'svelte';
import QualifierRemove from '$lib/components/QualifierRemove.svelte';
import QualifierKey from '$lib/components/QualifierKey.svelte';

export type Qualifier = {
	key: string;
	value: string | undefined;
	operator: string;
};

// type Update = {
// 	range: { from: number, to: number }, 
// 	text: string
// }

// const ANNOTATION_VALUE = 'qualifierSync';
// const qualifierAnnotation = Annotation.define();

class ButtonWidget extends WidgetType {
	constructor(readonly range: { from: number; to: number }, readonly atomic: boolean) {
		super();
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierRemove, {
			props: {
				range: this.range
			},
			target: container,
		});
		return container;
	}
}

class QualifierKeyWidget extends WidgetType {
	constructor(readonly key: string, readonly operator: string, readonly atomic: boolean ) {
		super();
	}
	eq(widget: WidgetType): boolean {
		// todo
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierKey, {
			props: {
				key: this.key,
				operator: this.operator
			},
			target: container,
		});
		return container;
	}
}

// class QualifierWidget extends WidgetType {
// 	constructor(
// 		readonly qualifier: Qualifier,
// 		readonly range: { from: number; to: number },
// 		readonly update: (e: Update) => void
// 	) {
// 		super();
// 	}

// 	// prevent re-mounting component if qualifier unchanged
// 	eq(other: QualifierWidget) {
// 		return (
// 			JSON.stringify(this.qualifier) == JSON.stringify(other.qualifier) &&
// 			JSON.stringify(this.range) === JSON.stringify(other.range)
// 		);
// 	}

// 	updateDOM(dom: HTMLElement, view: EditorView): boolean {
// 		// prevent svelte component from re-mounting?
// 	}

// 	toDOM() {
// 		const container = document.createElement('span');
// 		container.style.cssText = `position: relative;`;
// 		mount(QualifierComponent, {
// 			target: container,
// 			props: {
// 				qualifier: this.qualifier,
// 				range: this.range,
// 				update: this.update,
// 			}
// 		});
// 		return container;
// 	}
// }

function getQualifiers(view: EditorView) {
	const widgets : Range<Decoration>[] = [];
	const doc = view.state.doc.toString();

	syntaxTree(view.state).iterate({
		enter: (node) => {
			if (node.name === 'Qualifier') {
				// Mark decoration to create wrapper element, non-atomic
				const qualifierMark = Decoration.mark({
					class: 'qualifier', 
					inclusive: true,  
					atomic: false // invented!
				})
				widgets.push(qualifierMark.range(node.from, node.to))

				// Button widget - atomic
				const removeBtnDecoration = Decoration.widget({
					widget: new ButtonWidget({ from: node.from, to: node.to }, true),
					side: 1
				})
				widgets.push(removeBtnDecoration.range(node.to))

				// Qualifier key + operator widget - atomic
				const qKeyNode = node.node.getChild('QualifierKey');
				const qOperatorNode = qKeyNode?.nextSibling;
				const operator = doc.slice(qOperatorNode?.from, qOperatorNode?.to)
				const qKey = doc.slice(qKeyNode?.from, qKeyNode?.to);

				const qualifierKeyecoration = Decoration.replace({
					widget: new QualifierKeyWidget(qKey, operator, true)
				})
				widgets.push(qualifierKeyecoration.range(qKeyNode?.from, qOperatorNode?.to))

				// const qKeyNode = node.node.getChild('QualifierKey');
				// const qOperatorNode = qKeyNode?.nextSibling;
				// const qValueNode = node.node.getChild('QualifierValue');
				// const doc = view.state.doc.toString();

				// const qualifier = {
				// 	key: doc.slice(qKeyNode?.from, qKeyNode?.to),
				// 	value: qValueNode ? doc.slice(qValueNode?.from, qValueNode?.to) : undefined,
				// 	operator: doc.slice(qOperatorNode?.from, qOperatorNode?.to)
				// }
				// const range = { from: node.from, to: node.to };

				// const decoration = Decoration.replace({
				// 	inclusiveStart: true,
				// 	inclusiveEnd: true,
				// 	widget: new QualifierWidget(qualifier, range, onUpdateQualifierValue(view))
				// });
				// /// range ??
				// widgets.push(decoration.range(range.from, range.to));
			}
		}
	});
	return Decoration.set(widgets, true); // true = sort
}

export const qualifierPlugin = ViewPlugin.fromClass(
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
		eventHandlers: {
			// ??
		},
		provide: (plugin) =>
			EditorView.atomicRanges.of((view) => {
				const filteredRanges = view.plugin(plugin)?.qualifiers.update({ filter: filterOutAtomic })
				return filteredRanges || Decoration.none;
			})
	}
);

// function insertQuotes(view: EditorView) {
// 	syntaxTree(view.state).iterate({
// 		enter: (node) => {
// 			if (node.name === 'Qualifier') {
// 				const value = node.node.getChild('QualifierValue')
// 				if (!value) {
// 					console.log('yes!')
// 						view.dispatch({
// 							changes: { from: node.to, to: node.to, insert: '""' }
// 						})
// 				}
// 			}
// 		}
// 	})
// }

// filter out non-atomics using custom property 'atomic'
function filterOutAtomic(from: number, to: number, decoration: Decoration) {
	return decoration.spec?.atomic || decoration.spec?.widget?.atomic;
}