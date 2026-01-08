import { ViewPlugin, EditorView, type DecorationSet, ViewUpdate } from '@codemirror/view';
import type { QualifierValidator, QualifierWidgetRenderer } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet, qualifierWidgetRendererFacet } from './qualifierFacet.js';
import { qualifierSemanticField, setQualifierSemantic } from './qualifierValidation.js';
import { EditorState } from '@codemirror/state';
import { validateQualifiers } from './extender.js';
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
				for (const tr of update.transactions) {
					if (tr.effects.some((e) => e.is(setQualifierSemantic))) {
						this.decorations = addQualifiers(update.view);
						break;
					}
				}
			}
		},
		{
			decorations: (instance) => instance.decorations,
			provide: () => [
				qualifierSemanticField,
				qualifierValidatorFacet.of(validateQualifier),
				qualifierWidgetRendererFacet.of(renderer),

				EditorState.transactionExtender.of(validateQualifiers),

				// no - because i also add entire qualifiers as mark decorations
				// EditorView.atomicRanges.of((view) => {
				// 	return view.plugin(plugin)?.decorations || Decoration.none;
				// })

				EditorView.atomicRanges.of((view) => view.state.field(qualifierSemanticField).atomicRanges)
			]
		}
	);
};

export default lxlQualifierPlugin;
