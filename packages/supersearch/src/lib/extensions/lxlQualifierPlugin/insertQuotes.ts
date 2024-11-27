import { Transaction, type TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Moves cursor into an empty quote on falsy qualifier value
 */

const insertQuotes = (tr: Transaction) => {
	let foundEmptyQValue = false;
	const changes: TransactionSpec = {
		changes: {
			from: tr.state.selection.main.head,
			to: tr.state.selection.main.head,
			insert: '""'
		},
		sequential: true,
		selection: { anchor: tr.state.selection.main.head + 1 }
	};
	syntaxTree(tr.state).iterate({
		enter: (node) => {
			if (node.name === 'Qualifier') {
				const qValue = node.node.getChild('QualifierValue');
				if (!qValue) {
					foundEmptyQValue = true;
					return true;
				}
			}
		}
	});
	return foundEmptyQValue ? [tr, changes] : tr;
};

export default insertQuotes;
