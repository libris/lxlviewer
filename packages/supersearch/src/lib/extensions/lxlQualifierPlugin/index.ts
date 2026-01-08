import { ViewPlugin, EditorView, type DecorationSet, ViewUpdate } from '@codemirror/view';
import type { QualifierValidator, QualifierWidgetRenderer } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet, qualifierWidgetRendererFacet } from './qualifierFacet.js';
import { qualifierSemanticField } from './qualifierValidation.js';
import { addQualifiers } from './qualifierDecorations.js';
import { EditorState } from '@codemirror/state';
// import { balanceInnerParens, createGhostGroup, handleInputBeforeGroup, jumpPastParens, removeGhostGroup, repairGhostGroup } from './ghostGroup.js';
import insertSpaceAroundQualifier from './insertSpaceAroundQualifier.js';

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

				EditorView.atomicRanges.of((view) => view.state.field(qualifierSemanticField).atomicRanges),

				// ghost group filters -->
				// EditorState.transactionFilter.of(jumpPastParens),
				// EditorState.transactionFilter.of(createGhostGroup),
				// EditorState.transactionFilter.of(handleInputBeforeGroup),
				// EditorState.transactionFilter.of(removeGhostGroup),
				// EditorState.transactionFilter.of(repairGhostGroup),
				// EditorState.transactionFilter.of(balanceInnerParens),
				// <--
				EditorState.transactionFilter.of(insertSpaceAroundQualifier)
			]
		}
	);
};

export default lxlQualifierPlugin;
