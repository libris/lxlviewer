import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Moves cursor into an empty () after typing the QualifierOperator
 * Inserts a wildcard if empty () - (empty groups are disallowed)
 */
const insertParens = (tr: Transaction) => {
	if (
		!tr.isUserEvent('input') &&
		!tr.isUserEvent('delete') &&
		!tr.isUserEvent('delete.backward') &&
		!tr.isUserEvent('delete.forward')
	) {
		return tr;
	}

	const start = tr.startState;
	const state = tr.state;
	const head = state.selection.main.head;

	let changes = null;

	// Detect typing right after a QualifierOperator
	const nodeBefore = syntaxTree(state).resolveInner(head, -1);
	if (nodeBefore.name === 'QualifierOperator') {
		const textAfter = start.sliceDoc(nodeBefore.to);
		if (!textAfter || /^\s/.test(textAfter)) {
			changes = {
				changes: {
					from: head,
					to: head,
					insert: '(*)'
				},
				sequential: true,
				selection: { anchor: head + 2 }
			};
			return [tr, changes];
		}
	}

	// Detect being inside a autocompleted group (*) and remove '*' when typing
	const node = syntaxTree(state).resolveInner(head, 0);
	if (node.name === 'Group') {
		const groupBefore = start.sliceDoc(node.from, node.to);
		const groupAfter = state.sliceDoc(node.from, node.to);

		if (groupBefore === '(*)') {
			changes = {
				changes: {
					from: node.from + 1,
					to: node.from + 2,
					insert: ''
				},
				sequential: true
			};
			return [tr, changes];
		}

		// re-add '*' when group is again empty
		if (groupBefore !== '()' && groupAfter === '()') {
			changes = {
				changes: {
					from: node.from + 1,
					to: node.from + 1,
					insert: '*'
				},
				sequential: true,
				selection: { anchor: node.from + 2 }
			};
			return [tr, changes];
		}
	}

	return tr;
};

export default insertParens;
