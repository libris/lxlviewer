import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { mount } from 'svelte';
import QualifierComponent from '$lib/components/QualifierComponent.svelte';

export type Qualifier = {
	key: string;
	value: string | undefined;
	operator: string;
};

class QualifierWidget extends WidgetType {
	constructor(
		readonly qualifier: Qualifier,
		readonly range: { from: number; to: number },
		readonly update: (e: { range: { from: number, to: number }, text: string}) => void
	) {
		super();
	}

	// eq(other: QualifierWidget) {
	//   return (
	//     this.qualifier.type == other.qualifier.type &&
	//     this.qualifier.value == other.qualifier.value &&
	//     this.range == other.range
	//   );
	// }

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

function qualifiers(view: EditorView) {
	const widgets = [];

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

				// todo move
				function onUpdate(e) {
					console.log('recieved!', e)
					view?.dispatch({
						changes: { from: e.range.from, to: e.range.to, insert: e.text }
					})
				}

				const decoration = Decoration.replace({
					inclusiveStart: true,
					inclusiveEnd: true,
					widget: new QualifierWidget(qualifier, range, onUpdate)
				});
				widgets.push(decoration.range(node.from, node.to));
			}
		}
	});
	return Decoration.set(widgets);
}

export const qualifierPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;
		constructor(view: EditorView) {
			this.decorations = qualifiers(view);
		}

		update(update: ViewUpdate) {
			if (
				update.docChanged ||
				update.viewportChanged ||
				syntaxTree(update.startState) != syntaxTree(update.state)
			) {
				this.decorations = qualifiers(update.view);
			}
		}
	},
	{
		decorations: (instance) => instance.decorations,
		provide: (plugin) =>
			EditorView.atomicRanges.of((view) => {
				return view.plugin(plugin)?.decorations || Decoration.none;
			})
	}
);
