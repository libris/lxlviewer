import { ViewPlugin, EditorView, Decoration } from '@codemirror/view';
import type { QualifierValidator, QualifierWidgetRenderer } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet, qualifierWidgetRendererFacet } from './qualifierFacet.js';
import { qualifierSemanticField } from './qualifierValidation.js';
import { LxlQualifier } from './qualifierPlugin.js';

const lxlQualifierPlugin = (
	validateQualifier: QualifierValidator,
	renderer: QualifierWidgetRenderer
) => {
	return ViewPlugin.fromClass(LxlQualifier, {
		decorations: (instance) => instance.decorations,
		provide: (plugin) => [
			qualifierSemanticField,
			qualifierValidatorFacet.of(validateQualifier),
			qualifierWidgetRendererFacet.of(renderer),

			EditorView.atomicRanges.of((view) => {
				return view.plugin(plugin)?.decorations || Decoration.none;
			})
		]
	});
};

export default lxlQualifierPlugin;
