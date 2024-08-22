import type { EditorState } from '@codemirror/state';
import getMainSelection from './getMainSelection';

function getEditedPart(editorState: EditorState) {
	const mainSelection = getMainSelection(editorState);
	const wordAtMainSelection = editorState.wordAt(mainSelection.anchor);
	if (wordAtMainSelection) {
		return {
			value: editorState.sliceDoc(wordAtMainSelection.from, wordAtMainSelection.to),
			from: wordAtMainSelection.from,
			to: wordAtMainSelection.to
		};
	}

	return null;
}

export default getEditedPart;

/*
// Alternative without wordAt (allows all characters except whitespaces)
function getEditedPart(editorState: EditorState) {
	const mainSelection = getMainSelection(editorState)
	const doc = editorState.doc.toString()

	const editedPartStart = doc.slice(0, mainSelection.anchor).split(/\s+/).pop();
	const editedPartEnd = doc.slice(mainSelection.anchor).split(/\s+/)[0];

	if (editedPartStart) {
		return {
			value: editedPartStart + editedPartEnd,
			from: doc.lastIndexOf(editedPartStart),
			to: mainSelection.anchor + (editedPartEnd.length || 0)
		};
	}
}
	*/
