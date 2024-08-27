import type { EditorState } from '@codemirror/state';
import getMainSelection from './getMainSelection';

/**
 * Gets the edited range from the editor state
 * (including the characters surrounding the main selection up until the closest whitespaces)
 */

function getEditedRange(editorState: EditorState) {
	/**
	 * Note that we cannot use [wordAt](https://codemirror.net/docs/ref/#state.EditorState.wordAt) as we
	 * want to match all characters except whitespaces (and not only word characters as in `wordAt`)
	 */

	const mainSelection = getMainSelection(editorState);

	const doc = editorState.doc.toString();

	return {
		from: doc.lastIndexOf(doc.slice(0, mainSelection.anchor).split(/\s+/).pop()!),
		to: mainSelection.anchor + (doc.slice(mainSelection.anchor).split(/\s+/)[0].length || 0)
	};
}

export default getEditedRange;
