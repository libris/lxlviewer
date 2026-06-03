import type { EditorState } from '@codemirror/state';

export function isEqualState(a?: EditorState, b?: EditorState) {
	return (
		a &&
		b &&
		a.doc.toString === b.doc.toString &&
		a.selection.main.anchor === b.selection.main.anchor &&
		a.selection.main.head === b.selection.main.head
	);
}
