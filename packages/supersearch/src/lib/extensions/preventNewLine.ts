import { EditorState, Prec } from '@codemirror/state';

/**
 * CodeMirror extension thats prevents inserted newlines (either by typing or pasting).
 *
 * @param {boolean} replaceWithSpace Controls if newline characters should be replaced with spaces.
 */

const preventNewLine = ({ replaceWithSpace = false }: { replaceWithSpace: boolean }) =>
	Prec.highest(
		EditorState.transactionFilter.of((tr) => {
			if (tr.newDoc.lines > 1) {
				return [
					tr,
					{
						changes: {
							from: 0,
							to: tr.newDoc.length,
							insert: tr.newDoc.sliceString(0, undefined, replaceWithSpace ? ' ' : '') // flatten multi-lined text
						},
						sequential: true
					}
				];
			} else {
				return [tr];
			}
		})
	);

export default preventNewLine;
