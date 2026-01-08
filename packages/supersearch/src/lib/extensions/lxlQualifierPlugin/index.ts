import { ViewPlugin, EditorView, type DecorationSet, ViewUpdate } from '@codemirror/view';
import type { QualifierValidator, QualifierWidgetRenderer } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet, qualifierWidgetRendererFacet } from './qualifierFacet.js';
import { qualifierSemanticField } from './qualifierValidation.js';
import { addQualifiers } from './qualifierDecorations.js';

const lxlQualifierPlugin = (
	validateQualifier: QualifierValidator,
	renderer: QualifierWidgetRenderer
) => {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			constructor(view: EditorView) {
				this.decorations = addQualifiers(view);
			}

			update(update: ViewUpdate) {
				const prev = update.startState.field(qualifierSemanticField);
				const next = update.state.field(qualifierSemanticField);

				if (prev !== next) {
					this.decorations = addQualifiers(update.view);
				}
			}
		},
		{
			decorations: (instance) => instance.decorations,
			provide: () => [
				qualifierSemanticField,
				qualifierValidatorFacet.of(validateQualifier),
				qualifierWidgetRendererFacet.of(renderer),

				EditorView.atomicRanges.of((view) => view.state.field(qualifierSemanticField).atomicRanges)
			]
		}
	);
};

export default lxlQualifierPlugin;
