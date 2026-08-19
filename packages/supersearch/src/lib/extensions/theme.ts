import { EditorView } from '@codemirror/view';
import { drawSelection } from '@codemirror/view';

export const draw = drawSelection();

export const theme = EditorView.theme({
	'&.cm-focused .cm-cursor': {
		borderLeft: '1.2px solid #000',
		marginLeft: '0px'
	},
	'&.cm-editor .cm-selectionLayer': {
		zIndex: '1!important'
	},
	'&.cm-focused .cm-selectionBackground': {
		background: '#3b82f640!important'
	}
});
