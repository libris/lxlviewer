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
			this.props.operator === other.props.operator &&
			this.props.valueLabel === other.props.valueLabel &&
			this.props.removeLink === other.props.removeLink
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

class GhostGroupWidget extends WidgetType {
	eq(): boolean {
		return true;
	}
	toDOM(): HTMLElement {
		const container = document.createElement('span');
		container.className = 'lxl-ghost-group';
		return container;
	}
}

export function addDecorations(view: EditorView) {
	const SHOW_GHOST_GROUP = false;

	const { qualifiers } = view.state.field(qualifierStateField);
	const decorations: Range<Decoration>[] = [];
	const renderer = view.state.facet(qualifierRenderFacet);

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

		const valueNode = qualifier.node.getChild('QualifierValue');

		// value mark (for non-atomic)
		if (!qualifier.valueLabel && valueNode) {
			decorations.push(
				Decoration.mark({
					class: 'lxl-qualifier-value',
					inclusive: false
				}).range(valueNode.from, valueNode.node.to)
			);
		}

		// hide ghost groups
		if (valueNode) {
			const ghostGroup = valueNode.getChild('QualifierOuterGroup');

			if (ghostGroup && !SHOW_GHOST_GROUP) {
				const doc = view.state.doc.toString();
				const openingParens = ghostGroup.from;
				const closingParens = ghostGroup.to;

				if (
					doc.slice(openingParens, openingParens + 1) === '(' &&
					doc.slice(closingParens - 1, closingParens) === ')'
				) {
					const parensMark = Decoration.replace({
						widget: new GhostGroupWidget(),
						inclusive: false
					});

					decorations.push(parensMark.range(openingParens, openingParens + 1));
					decorations.push(parensMark.range(closingParens - 1, closingParens));
				}
			}
		}

		if (!renderer) return;

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
