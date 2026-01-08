import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import type { QualifierWidgetProps } from '$lib/types/lxlQualifierPlugin.js';
import { type Range } from '@codemirror/state';
import { qualifierSemanticField } from './qualifierValidation.js';
import { qualifierWidgetRendererFacet } from './qualifierFacet.js';

class QualifierWidget extends WidgetType {
	private cleanup?: () => void;

	constructor(readonly props: QualifierWidgetProps) {
		super();
	}

	eq(other: QualifierWidget): boolean {
		return (
			this.props.keyLabel === other.props.keyLabel &&
			this.props.valueLabel === other.props.valueLabel &&
			this.props.removeLink === other.props.removeLink &&
			this.props.value === other.props.value
		);
	}

	toDOM(view: EditorView): HTMLElement {
		const container = document.createElement('span');
		container.className = 'atomic';

		const render = view.state.facet(qualifierWidgetRendererFacet);
		if (render) {
			const result = render(container, this.props);
			this.cleanup = result?.destroy;
		}

		return container;
	}

	destroy() {
		this.cleanup?.();
	}
}

export function addQualifiers(view: EditorView) {
	const stateFields = view.state.field(qualifierSemanticField, false);

	const decorations: Range<Decoration>[] = [];

	stateFields?.qualifiers.forEach((qualifier) => {
		const operatorNode = qualifier.node.getChild('QualifierOperator');
		const operator = operatorNode
			? view.state.doc.toString().slice(operatorNode?.from, operatorNode?.to)
			: '';

		// lxl-qualifier element
		decorations.push(
			Decoration.mark({
				class: 'lxl-qualifier',
				attributes: {
					style: 'display: inline-block; margin-left: 1px; margin-right: 1px;'
				},
				inclusive: true
			}).range(qualifier.node.from, qualifier.node.to)
		);

		// QualifierWidget
		if (qualifier.atomicFrom != null) {
			console.log('will push', qualifier);

			decorations.push(
				Decoration.replace({
					widget: new QualifierWidget({ operator, ...qualifier })
				}).range(qualifier.atomicFrom, qualifier.atomicTo)
			);
		} else {
			console.log('will not push', qualifier);
		}
	});
	return Decoration.set(decorations, true);
}

// export const qualifierDecorations = EditorView.decorations.compute(
// 	[qualifierSemanticField],
// 	(state) => {
// 		const sem = state.field(qualifierSemanticField);
// 		const decorations: Range<Decoration>[] = [];

// 		syntaxTree(state).iterate({
// 			enter(node) {
// 				if (node.name !== 'Qualifier') return;

// 				const data = sem.data.get(`${node.from}-${node.to}`);

// 				// invalidated
// 				if (!data || data.invalid) return;

// 				const operatorNode = node.node.getChild('QualifierOperator');
// 				const operator = operatorNode
// 					? state.doc.toString().slice(operatorNode?.from, operatorNode?.to)
// 					: '';

// 				// lxl-qualifier element
// 				decorations.push(
// 					Decoration.mark({
// 						class: 'lxl-qualifier',
// 						attributes: {
// 							style: 'display: inline-block; margin-left: 1px; margin-right: 1px;'
// 						},
// 						inclusive: true
// 					}).range(node.from, node.to)
// 				);

// 				// QualifierWidget
// 				decorations.push(
// 					Decoration.replace({
// 						widget: new QualifierWidget({ operator, ...data })
// 						// side: 1
// 					}).range(node.from, data.valueLabel ? node.to : operatorNode?.to)
// 				);
// 			}
// 		});

// 		return Decoration.set(decorations, true);
// 	}
// );
