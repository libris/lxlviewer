import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import type { Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { mount } from 'svelte';
import QualifierComponent from '$lib/components/QualifierComponent.svelte';

export type Qualifier = {
	key: string;
	value: string | undefined;
	operator: string;
};

type Update = {
	range: { from: number, to: number }, 
	text: string
}

class QualifierWidget extends WidgetType {
	constructor(
		readonly qualifier: Qualifier,
		readonly range: { from: number; to: number },
		readonly update: (e: Update) => void
	) {
		super();
	}

	// prevent re-mounting component if qualifier unchanged
	eq(other: QualifierWidget) {
		return (
			JSON.stringify(this.qualifier) == JSON.stringify(other.qualifier) &&
			JSON.stringify(this.range) === JSON.stringify(other.range)
		);
	}

	toDOM() {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierComponent, {
			target: container,
			props: {
				qualifier: this.qualifier,
				range: this.range,
				update: this.update,
			}
		});
		return container;
	}
}

function getQualifiers(view: EditorView) {
	const widgets : Range<Decoration>[] = [];

	syntaxTree(view.state).iterate({
		enter: (node) => {
			if (node.name === 'Qualifier') {
				const qKeyNode = node.node.getChild('QualifierKey');
				const qOperatorNode = qKeyNode?.nextSibling;
				const qValueNode = node.node.getChild('QualifierValue');
				const doc = view.state.doc.toString();

				const qualifier = {
					key: doc.slice(qKeyNode?.from, qKeyNode?.to),
					value: qValueNode ? doc.slice(qValueNode?.from, qValueNode?.to) : undefined,
					operator: doc.slice(qOperatorNode?.from, qOperatorNode?.to)
				}
				const range = { from: node.from, to: node.to };

				const decoration = Decoration.replace({
					inclusiveStart: true,
					inclusiveEnd: true,
					widget: new QualifierWidget(qualifier, range, onUpdateQualifierValue(view))
				});
				/// range ??
				widgets.push(decoration.range(range.from, range.to));
			}
		}
	});
	return Decoration.set(widgets);
}

function onUpdateQualifierValue(view: EditorView) {
	return (e: Update) => {
		console.log('recieved!', e)
		view?.dispatch({
			changes: { from: e.range.from, to: e.range.to, insert: e.text }
		})
	}
}

export const qualifierPlugin = ViewPlugin.fromClass(
	class {
		qualifiers: DecorationSet;
		constructor(view: EditorView) {
			this.qualifiers = getQualifiers(view);
		}

		update(update: ViewUpdate) {
			if (
				update.docChanged ||
				update.viewportChanged ||
				syntaxTree(update.startState) != syntaxTree(update.state)
			) {
				// placeholderMatcher.updateDeco equiv?
				this.qualifiers = getQualifiers(update.view);
			}
		}
	},
	{
		decorations: (instance) => instance.qualifiers,
		provide: (plugin) =>
			EditorView.atomicRanges.of((view) => {
				return view.plugin(plugin)?.qualifiers || Decoration.none;
			})
	}
);
