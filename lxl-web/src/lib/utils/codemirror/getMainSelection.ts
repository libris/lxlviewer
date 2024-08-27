import type { EditorState } from '@codemirror/state';
import type { Selection } from '$lib/components/CodeMirror.svelte';

/**
 * Gets the main selection from the editor state
 */

function getMainSelection(editorState: EditorState): Selection {
	const mainSelection = editorState.selection.main;
	return { anchor: mainSelection.anchor, head: mainSelection.head };
}

export default getMainSelection;
