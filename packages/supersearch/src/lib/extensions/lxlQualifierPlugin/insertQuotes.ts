import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Moves cursor into an empty quote after typing the QualifierOperator
 */
const insertQuotes = (tr: Transaction) => {
	if (!tr.isUserEvent('input') || tr.isUserEvent('input.complete')) {
		return tr;
	}
	let changes = null;
	syntaxTree(tr.state).iterate({
		enter: (node) => {
			/** TODO: We can probably optimize this as it currently traverses the entire syntax tree (when it should be enough to just check the edited/added part) */
			if (node.name === 'QualifierOperator') {
				const operatorEnd = node.to;
				const oldCursorPos = tr.startState.selection.main.head;
				const newCursorPos = tr.state.selection.main.head;
				if (operatorEnd - 1 === oldCursorPos) {
					changes = {
						changes: {
							from: newCursorPos,
							to: newCursorPos,
							insert: '""'
						},
						sequential: true,
						selection: { anchor: newCursorPos + 1 }
					};
					return true;
				}
			}
		}
	});
	return changes ? [tr, changes] : tr;
};

export default insertQuotes;
