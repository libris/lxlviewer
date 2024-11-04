import { EditorState, Prec } from '@codemirror/state';
import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';

const ENDS_WITH_WHITESPACE = new RegExp(/\s$/);
const BEGINS_WITH_WHITESPACE = new RegExp(/^\s/);

/**
 * Prevents existing qualifier widgets to be edited if inserting a character before them (by adding an extra whitespace after the inserted character)
 */

const preventInsertBeforeQualifier = Prec.highest(
	EditorState.transactionFilter.of((tr) => {
		if (!tr.docChanged) {
			return tr;
		}

		let insertSpacePos: number | undefined;

		tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
			const contentBefore = tr.startState.sliceDoc(0, fromA);
			const contentAfter = tr.startState.sliceDoc(toA);
			if (
				inserted.length &&
				(fromA === 0 || ENDS_WITH_WHITESPACE.test(contentBefore)) && // test if editing the beginning of the string or if there is a whitespace before the inserted characters
				!ENDS_WITH_WHITESPACE.test(inserted.toString()) && // only proceed if inserted content doesn't end with a whitespace
				QUALIFIER_REGEXP.test(contentAfter) && // test if inserted character is followed by a qualifier
				!BEGINS_WITH_WHITESPACE.test(contentAfter) // if we already inserted whitespace, we don't want to keep doing it
			) {
				insertSpacePos = toB;
			}
		});

		if (insertSpacePos) {
			return [
				tr,
				{
					changes: {
						from: insertSpacePos,
						insert: ' '
					},
					sequential: true
				}
			];
		} else return [tr];
	})
);

export default preventInsertBeforeQualifier;
