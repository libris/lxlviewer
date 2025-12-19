import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { type Range } from '@codemirror/state';
import { qualifierSemanticField } from './qualifierValidation.js';
import { qualifierWidgetRendererFacet } from './qualifierFacet.js';
import type { QualifierWidgetProps } from './index.js';

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

export const qualifierDecorations = EditorView.decorations.compute(
	[qualifierSemanticField],
	(state) => {
		const sem = state.field(qualifierSemanticField);
		const decorations: Range<Decoration>[] = [];

		syntaxTree(state).iterate({
			enter(node) {
				if (node.name !== 'Qualifier') return;

				const data = sem.get(`${node.from}-${node.to}`);

				// invalidated
				if (!data || data.invalid) return;

				const operatorNode = node.node.getChild('QualifierOperator');
				const operator = operatorNode
					? state.doc.toString().slice(operatorNode?.from, operatorNode?.to)
					: '';

				const props: QualifierWidgetProps = {
					operator,
					...data
				};

				decorations.push(
					Decoration.replace({
						widget: new QualifierWidget(props)
						// side: 1
					}).range(node.from, data.valueLabel ? node.to : operatorNode?.to)
				);

				// decorations.push(
				// 	Decoration.mark({
				// 		class: "lxl-qualifier"
				// 	}).range(node.from, node.to)
				// )
			}
		});

		return Decoration.set(decorations, true);
	}
);
