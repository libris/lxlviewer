import { EditorState } from '@codemirror/state';
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view';
import insertSpaceAroundQualifier from './insertSpaceAroundQualifier2.js';
import {
	balanceInnerParens,
	createGhostGroup,
	handleInputBeforeGroup,
	jumpPastParens,
	removeGhostGroup,
	repairGhostGroup
} from './ghostGroup.js';
import { qualifierValidatorFacet, qualifierWidgetRendererFacet } from './qualifierFacet.js';
import type { QualifierValidator, QualifierWidgetRenderer } from '$lib/types/lxlQualifierPlugin.js';
import { LxlQualifier } from './qualifierPlugin.js';

const lxlQualifierPlugin = (
	validateQualifier: QualifierValidator,
	renderer: QualifierWidgetRenderer
) => {
	return ViewPlugin.fromClass(LxlQualifier, {
		decorations: (instance) => instance.decorations,
		provide: (plugin) => [
			qualifierValidatorFacet.of(validateQualifier),
			qualifierWidgetRendererFacet.of(renderer),

			EditorView.atomicRanges.of((view) => {
				return view.plugin(plugin)?.decorations || Decoration.none;
			}),
			// ghost group filters -->
			EditorState.transactionFilter.of(jumpPastParens),
			EditorState.transactionFilter.of(createGhostGroup),
			EditorState.transactionFilter.of(handleInputBeforeGroup),
			EditorState.transactionFilter.of(removeGhostGroup),
			EditorState.transactionFilter.of(repairGhostGroup),
			EditorState.transactionFilter.of(balanceInnerParens),
			// <--
			EditorState.transactionFilter.of(insertSpaceAroundQualifier)
		]
	});
};

export default lxlQualifierPlugin;
