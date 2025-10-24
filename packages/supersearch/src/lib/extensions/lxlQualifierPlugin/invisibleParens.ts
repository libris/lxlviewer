import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

/**
 * Moves cursor into an empty () after typing the QualifierOperator
 * Inserts a wildcard if empty () - (empty groups are disallowed)
 */
export const insertParens = (tr: Transaction) => {
	if (!tr.isUserEvent('input')) return tr;

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

	return tr;
};

/**
 * Detect being inside a autocompleted group (*) and remove '*' when typing
 * Re-add '*' when group is again empty
 */
export const insertParensWildcard = (tr: Transaction) => {
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

	const node = syntaxTree(state).resolveInner(head, 0);
	if (isHiddenGroup(node)) {
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

/**
 * Prevents deletion of invisible parentheses around groups. Instead, jump past them.
 */
export const jumpPastParens = (tr: Transaction) => {
	const isBackspace = tr.isUserEvent('delete.backward');
	const isDelete = tr.isUserEvent('delete.forward');

	if (!isBackspace && !isDelete) return tr;

	const state = tr.startState;
	const head = state.selection.main.head;

	if (isBackspace) {
		// 1) Backspace after a group -> jump inside
		const nodeBefore = syntaxTree(state).resolveInner(head, -1);
		if (isHiddenGroup(nodeBefore) && nodeBefore.to === head) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: nodeBefore.to - 1 },
				userEvent: 'input'
			};
		}

		// 2) Backspace at beginning of group -> jump outside
		const nodeInside = syntaxTree(state).resolveInner(head, 0);
		if (isHiddenGroup(nodeInside)) {
			const openPos = nodeInside.from;
			if (head === openPos + 1) {
				return {
					changes: [],
					sequential: true,
					selection: { anchor: openPos },
					userEvent: 'input'
				};
			}
		}
	}

	if (isDelete) {
		// 3) Delete before a group -> jump inside
		const nodeAfter = syntaxTree(state).resolveInner(head, 1);
		if (isHiddenGroup(nodeAfter) && nodeAfter.from === head) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: nodeAfter.from + 1 },
				userEvent: 'input'
			};
		}

		// 4) delete at end of group -> jump outside
		const nodeInside = syntaxTree(state).resolveInner(head, 0);
		if (isHiddenGroup(nodeInside)) {
			const closePos = nodeInside.to;
			if (head === closePos - 1) {
				return {
					changes: [],
					sequential: true,
					selection: { anchor: closePos },
					userEvent: 'input'
				};
			}
		}
	}

	return tr;
};

/**
 * Returns true if the given node or position matches definition of
 * a Hidden Group (Group & direct child of QualifierValue)
 */
function isHiddenGroup(node: SyntaxNode) {
	if (node.name !== 'Group') return false;

	const parent = node.parent;
	if (!parent || parent.name !== 'QualifierValue') return false;

	const firstChild = parent.firstChild;
	if (!firstChild || firstChild.name !== 'Group' || firstChild.from !== node.from) {
		return false;
	}

	return true;
}
