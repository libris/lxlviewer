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
	const nodeBefore = syntaxTree(tr.state).resolveInner(tr.state.selection.main.head, -1);
	if (nodeBefore.name === 'QualifierOperator') {
		const textAfter = tr.state.sliceDoc(nodeBefore.to);
		if (!textAfter || /^\s/.test(textAfter)) {
			changes = {
				changes: {
					from: tr.state.selection.main.head,
					to: tr.state.selection.main.head,
					insert: '""'
				},
				sequential: true,
				selection: { anchor: tr.state.selection.main.head + 1 }
			};
		}
	}
	return changes ? [tr, changes] : tr;
};

export default insertQuotes;
