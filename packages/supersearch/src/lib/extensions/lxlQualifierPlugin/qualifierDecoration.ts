import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import type { QualifierRendererProps } from '$lib/types/lxlQualifierPlugin.js';
import { type Range } from '@codemirror/state';
import { qualifierStateField } from './qualifierValidation.js';
import { qualifierRenderFacet } from './qualifierFacet.js';

class QualifierWidget extends WidgetType {
	private cleanup?: () => void;

	constructor(readonly props: QualifierRendererProps) {
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

		const render = view.state.facet(qualifierRenderFacet);
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

export function addDecorations(view: EditorView) {
	const { qualifiers } = view.state.field(qualifierStateField);

	const decorations: Range<Decoration>[] = [];

	qualifiers.forEach((qualifier) => {
		// qualifier wrapper mark
		decorations.push(
			Decoration.mark({
				class: 'lxl-qualifier',
				attributes: {
					style: 'display: inline-block; margin-left: 1px; margin-right: 1px;'
				},
				inclusive: true
			}).range(qualifier.node.from, qualifier.node.to)
		);

		// value mark (for non-atomic)
		const valuNode = qualifier.node.getChild('QualifierValue');
		if (!qualifier.valueLabel && valuNode) {
			decorations.push(
				Decoration.mark({
					class: 'lxl-qualifier-value',
					inclusive: true
				}).range(valuNode.from, valuNode.node.to)
			);
		}

		// qualifier atomic widget
		if (qualifier.atomicFrom != null) {
			const operatorNode = qualifier.node.getChild('QualifierOperator');
			const operator = operatorNode
				? view.state.doc.toString().slice(operatorNode?.from, operatorNode?.to)
				: '';

			decorations.push(
				Decoration.replace({
					widget: new QualifierWidget({ operator, ...qualifier })
				}).range(qualifier.atomicFrom, qualifier.atomicTo)
			);
		}
	});
	return Decoration.set(decorations, true);
}
