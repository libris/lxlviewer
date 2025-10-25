import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

/**
 * Moves cursor into an empty () after typing the QualifierOperator
 * Inserts a wildcard if empty () - (empty groups are disallowed)
 */
export const insertGroup = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
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
 * Add a wildcard in an empty enclosing Group. Remove wildcard when user starts typing
 */
export const insertGroupWildcard = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
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
	const groupNode = getEnclosingGroup(resolvedNode);
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

	// 2) If the group is empty after edits, insert '*' to maintain a valid enclosing group
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
 * Prevents deletion of enclosing Groups parenthesis. Instead, jump past them.
 */
export const handleBackspace = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;

	const isBackspace = tr.isUserEvent('delete.backward');
	const isDelete = tr.isUserEvent('delete.forward');

	if (!isBackspace && !isDelete) return tr;

	const state = tr.startState;
	const head = state.selection.main.head;

	if (state.selection.main.from !== state.selection.main.to) {
		return tr;
	}

	if (isBackspace) {
		// 1) Backspace after a group -> jump inside
		const resolvedBefore = syntaxTree(state).resolveInner(head, -1);
		const groupBefore = getEnclosingGroup(resolvedBefore);
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
		const groupInside = getEnclosingGroup(resolvedInside);
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
		const groupAfter = getEnclosingGroup(resolvedAfter);
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
		const groupInside = getEnclosingGroup(resolvedInside);
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
 * Repairs enclosing group when user selects and deletes portion of it
 * given that the qualifier is still valid after change
 */
export const handleSelection = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
	if (
		!tr.isUserEvent('delete') &&
		!tr.isUserEvent('delete.backward') &&
		!tr.isUserEvent('delete.forward')
	) {
		return tr;
	}

	const start = tr.startState;
	const after = tr.state;

	// Only handle range deletions
	if (start.selection.main.from === start.selection.main.to) return tr;

	let fix = null;

	tr.changes.iterChanges((fromA, toA) => {
		const startNode = syntaxTree(start).resolveInner(fromA, 1);
		const endNode = syntaxTree(start).resolveInner(toA, -1);

		const groupAtStart = getEnclosingGroup(startNode);
		const groupAtEnd = getEnclosingGroup(endNode);

		// selection starts inside group, ends outside → repair with ')'
		if (groupAtStart && (!groupAtEnd || groupAtEnd !== groupAtStart)) {
			console.log('a');
			// Map group position into after state
			const newFrom = tr.changes.mapPos(groupAtStart.from);
			const newTo = tr.changes.mapPos(groupAtStart.to);

			// verify that the group still exists in the after tree
			const verifyNode = syntaxTree(after).resolveInner(newFrom, 1);
			const stillExists = getEnclosingGroup(verifyNode);
			if (!stillExists) return;

			const afterText = after.sliceDoc(newFrom, newTo);
			if (!afterText.endsWith(')')) {
				fix = {
					changes: { from: newTo, insert: ')' },
					sequential: true,
					userEvent: 'input'
				};
			}
			return;
		}

		// starts outside group, ends inside → repair with '('
		if (groupAtEnd && (!groupAtStart || groupAtEnd !== groupAtStart)) {
			console.log('b');
			const newFrom = tr.changes.mapPos(groupAtEnd.from);
			const newTo = tr.changes.mapPos(groupAtEnd.to);

			// Verify group still exists
			const verifyNode = syntaxTree(after).resolveInner(newFrom, 1);
			const stillExists = getEnclosingGroup(verifyNode);
			if (!stillExists) return;

			const afterText = after.sliceDoc(newFrom, newTo);
			if (!afterText.startsWith('(')) {
				fix = {
					changes: { from: newFrom, insert: '(' },
					sequential: true,
					selection: { anchor: newFrom + 1 },
					userEvent: 'input'
				};
			}
			return;
		}
	});

	return fix ? [tr, fix] : tr;
};

/**
 * Prevents breaking the enclosing group by typing between the operator and group start
 */
export const handleInput = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
	if (!tr.isUserEvent('input') && !tr.isUserEvent('paste')) return tr;

	const start = tr.startState;
	const head = start.selection.main.head;

	// Detect enclosing group directly after cursor
	const nodeAfter = syntaxTree(start).resolveInner(head, +1);
	const groupNode = getEnclosingGroup(nodeAfter);
	if (!groupNode) return tr;

	if (head !== groupNode.from) return tr;

	// shift text changes +1 position to the right
	const shiftedChanges: { from: number; to: number; insert: string }[] = [];
	let totalInsertedLength = 0;

	tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
		shiftedChanges.push({
			from: fromA + 1,
			to: toA + 1,
			insert: inserted.toString()
		});
		totalInsertedLength += inserted.length;
	});

	const newSelection = { anchor: head + 1 + totalInsertedLength };

	return [
		{
			changes: shiftedChanges,
			sequential: true,
			selection: newSelection,
			userEvent: tr.annotation(Transaction.userEvent) || 'input'
		}
	];
};

/**
 * Check if the node is loocated inside an enclosing Group (Group direct child of QualifierValue)
 * If so, return the group node
 */
function getEnclosingGroup(node: SyntaxNode): SyntaxNode | false {
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
