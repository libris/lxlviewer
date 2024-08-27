import type { EditorState } from '@codemirror/state';
import getMainSelection from './getMainSelection';

/**
 * Gets the edited range from the editorState
 * Note that we cannot use the [wordAt](https://codemirror.net/docs/ref/#state.EditorState.wordAt) as we want to match
 * all characters except whitespaces (and not only word characters as in `wordAt`)
 */
function getEditedRange(editorState: EditorState) {
	const mainSelection = getMainSelection(editorState);
	const doc = editorState.doc.toString(); // we cannot use editorState.wordAt(mainSelection.anchor) as we want to match all characters except whitespaces (not only word characters as in wordAt)

	return {
		from: doc.lastIndexOf(doc.slice(0, mainSelection.anchor).split(/\s+/).pop()!),
		to: mainSelection.anchor + (doc.slice(mainSelection.anchor).split(/\s+/)[0].length || 0)
	};
}

export default getEditedRange;
