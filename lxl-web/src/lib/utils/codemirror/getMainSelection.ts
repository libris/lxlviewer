import type { EditorState } from '@codemirror/state';
import type { Selection } from '$lib/components/CodeMirror.svelte';

function getMainSelection(editorState: EditorState): Selection {
	const mainSelection = editorState.selection.main;
	return { anchor: mainSelection.anchor, head: mainSelection.head };
}

export default getMainSelection;
