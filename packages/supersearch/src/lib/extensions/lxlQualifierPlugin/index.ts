import { ViewPlugin, EditorView, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import type { QualifierValidator, QualifierRenderer } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet, qualifierRenderFacet } from './qualifierFacet.js';
import { qualifierStateField } from './qualifierValidation.js';
import { addDecorations } from './qualifierDecoration.js';
import { stopEditingOnEsc } from './qualifierKeyMaps.js';
import {
	balanceInnerParens,
	createGhostGroup,
	handleInputBeforeGroup,
	jumpPastParens,
	removeGhostGroup,
	repairGhostGroup
} from './ghostGroup.js';
import insertSpaceAroundQualifier from './insertSpaceAroundQualifier.js';

const lxlQualifierPlugin = (validateFn: QualifierValidator, renderFn?: QualifierRenderer) => {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			constructor(view: EditorView) {
				this.decorations = addDecorations(view);
			}

			update(update: ViewUpdate) {
				const prev = update.startState.field(qualifierStateField);
				const next = update.state.field(qualifierStateField);

				if (prev !== next) {
					this.decorations = addDecorations(update.view);
				}
			}
		},
		{
			decorations: (instance) => instance.decorations,
			provide: () => [
				qualifierStateField,
				stopEditingOnEsc,
				qualifierValidatorFacet.of(validateFn),
				renderFn ? qualifierRenderFacet.of(renderFn) : [],

				EditorView.atomicRanges.of((view) => view.state.field(qualifierStateField).atomicRanges),

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
		}
	);
};

export default lxlQualifierPlugin;
