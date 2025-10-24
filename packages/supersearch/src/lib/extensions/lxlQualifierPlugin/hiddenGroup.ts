import type { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

/**
 * Moves cursor into an empty () after typing the QualifierOperator
 * Inserts a wildcard if empty () - (empty groups are disallowed)
 */
export const insertHiddenGroup = (tr: Transaction) => {
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
 * Add a wildcard in an empty Hidden Group. Remove wildcard when user starts typing
 */
export const insertGroupWildcard = (tr: Transaction) => {
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

	// Resolve the node at the cursor in the AFTER state
	const resolvedNode = syntaxTree(state).resolveInner(head, 0);
	const groupNode = isInsideHiddenGroup(resolvedNode);
	if (!groupNode) return tr;

	// Get the text of the group in start and after states
	const groupBefore = start.sliceDoc(groupNode.from, groupNode.to);
	const groupAfter = state.sliceDoc(groupNode.from, groupNode.to);

	// 1) If the group contains only (*) and user types, remove the '*'
	if (groupBefore === '(*)') {
		changes = {
			changes: {
				from: groupNode.from + 1,
				to: groupNode.from + 2,
				insert: ''
			},
			sequential: true
		};
		return [tr, changes];
	}

	// 2) If the group is empty after edits, insert '*' to maintain a valid hidden group
	if (groupBefore !== '()' && groupAfter === '()') {
		changes = {
			changes: {
				from: groupNode.from + 1,
				to: groupNode.from + 1,
				insert: '*'
			},
			sequential: true,
			selection: { anchor: groupNode.from + 2 } // place cursor after '*'
		};
		return [tr, changes];
	}

	return tr;
};

/**
 * Prevents deletion of Hidden Groups parenthesis. Instead, jump past them.
 */
export const jumpInsideHiddenGroup = (tr: Transaction) => {
	const isBackspace = tr.isUserEvent('delete.backward');
	const isDelete = tr.isUserEvent('delete.forward');

	if (!isBackspace && !isDelete) return tr;

	const state = tr.startState;
	const head = state.selection.main.head;

	if (isBackspace) {
		// 1) Backspace after a group -> jump inside
		const resolvedBefore = syntaxTree(state).resolveInner(head, -1);
		const groupBefore = isInsideHiddenGroup(resolvedBefore);
		if (groupBefore && head === groupBefore.to) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: groupBefore.to - 1 },
				userEvent: 'input'
			};
		}

		// 2) Backspace at beginning of group -> jump outside
		const resolvedInside = syntaxTree(state).resolveInner(head, 0);
		const groupInside = isInsideHiddenGroup(resolvedInside);
		if (groupInside) {
			const openPos = groupInside.from;
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
		const resolvedAfter = syntaxTree(state).resolveInner(head, 1);
		const groupAfter = isInsideHiddenGroup(resolvedAfter);
		if (groupAfter && head === groupAfter.from) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: groupAfter.from + 1 },
				userEvent: 'input'
			};
		}

		// 4) Delete at end of group -> jump outside
		const resolvedInside = syntaxTree(state).resolveInner(head, 0);
		const groupInside = isInsideHiddenGroup(resolvedInside);
		if (groupInside && head === groupInside.to - 1) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: groupInside.to },
				userEvent: 'input'
			};
		}
	}

	return tr;
};

/**
 * Repairs a hidden group when user selects and deletes portion of it
 */
export const repairHiddenGroup = (tr: Transaction) => {
	if (
		!tr.isUserEvent('delete') &&
		!tr.isUserEvent('delete.backward') &&
		!tr.isUserEvent('delete.forward')
	)
		return tr;

	const start = tr.startState;
	const after = tr.state;
	if (!tr.changes || tr.changes.empty) return tr;

	let fix = null;

	tr.changes.iterChanges((fromA, toA) => {
		// User deleted the start of a hidden group, add ) and jump inside
		const startNode = syntaxTree(start).resolveInner(fromA, 1); // look forward
		const groupStart = isInsideHiddenGroup(startNode);
		if (groupStart) {
			const newFrom = tr.changes.mapPos(groupStart.from);
			const newTo = tr.changes.mapPos(groupStart.to);
			const afterText = after.sliceDoc(newFrom, newTo);
			if (!afterText.startsWith('(')) {
				fix = {
					changes: { from: newFrom, insert: '(' },
					sequential: true,
					selection: { anchor: newFrom + 1 },
					userEvent: 'input'
				};
				return;
			}
		}

		// User deleted the end of a hidden group, add new )
		const endNode = syntaxTree(start).resolveInner(toA, -1); // look backward
		const groupEnd = isInsideHiddenGroup(endNode);
		if (groupEnd) {
			const newFrom = tr.changes.mapPos(groupEnd.from);
			const newTo = tr.changes.mapPos(groupEnd.to);
			const afterText = after.sliceDoc(newFrom, newTo);
			if (!afterText.endsWith(')')) {
				fix = {
					changes: { from: newTo, insert: ')' },
					sequential: true
				};
				return;
			}
		}
	});

	return fix ? [tr, fix] : tr;
};

/**
 * Check if the node is loocated inside a Hidden Group (Group direct child of QualifierValue)
 * If so, return the group node
 */
function isInsideHiddenGroup(node: SyntaxNode): SyntaxNode | false {
	if (!node) return false;

	let current: SyntaxNode | null = node;

	while (current && current.name !== 'Group') {
		current = current.parent;
	}

	if (!current) return false;

	const valueParent = current.parent;
	if (!valueParent || valueParent.name !== 'QualifierValue') return false;

	const firstChild = valueParent.firstChild;
	if (!firstChild || firstChild.name !== 'Group') return false;

	return firstChild;
}
