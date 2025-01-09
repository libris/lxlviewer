import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Moves cursor into an empty quote on falsy qualifier value
 */
const insertQuotes = (tr: Transaction) => {
	let changes = null;
	syntaxTree(tr.state).iterate({
		enter: (node) => {
			if (node.name === 'Qualifier') {
				const qValue = node.node.getChild('QualifierValue');
				const qKey = node.node.getChild('QualifierKey');
				if (qKey && !qValue && tr.isUserEvent('input')) {
					changes = {
						changes: {
							from: tr.state.selection.main.head,
							to: tr.state.selection.main.head,
							insert: '""'
						},
						sequential: true,
						selection: { anchor: tr.state.selection.main.head + 1 }
					};
					return true;
				}
			}
		}
	});
	return changes ? [tr, changes] : tr;
};

export default insertQuotes;
