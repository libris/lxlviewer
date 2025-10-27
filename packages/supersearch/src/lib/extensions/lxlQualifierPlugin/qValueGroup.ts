import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

/**
 * QualifierValue's first child must be a Group.
 * If not - add/repair it. Exception: quoted qualifier values
 */
export const enforceQValueGroup = (tr: Transaction) => {
	if (!tr.isUserEvent('input') && !tr.isUserEvent('delete')) {
		return tr;
	}

	const start = tr.startState;
	const after = tr.state;

	// don't touch groups within the outer group
	const from = start.selection.main.from;
	const to = start.selection.main.to;
	const nodeAtHead = syntaxTree(start).resolveInner(from, 0);
	const enclosingGroup = getEnclosingGroup(nodeAtHead);

	if (enclosingGroup && from > enclosingGroup.from && to < enclosingGroup.to) {
		return tr;
	}

	const changes: { from: number; to?: number; insert?: string }[] = [];
	let selection: { anchor: number } | undefined;

	syntaxTree(after).iterate({
		enter(node) {
			if (node.name !== 'Qualifier') return;

			const operatorNode = node.node.getChild('QualifierOperator');
			if (!operatorNode) return;

			const valueNode = node.node.getChild('QualifierValue');
			const opEnd = operatorNode.to;

			// skip quoted values - keep atomic ranges intact
			if (valueNode) {
				const valText = after.sliceDoc(valueNode.from, valueNode.to);
				if (valText.startsWith('"') && valText.endsWith('"')) {
					return;
				}
			}

			// missing QualifierValue; insert () and jump inside
			if (!valueNode) {
				changes.push({ from: opEnd, insert: '()' });
				selection = { anchor: opEnd + 1 };
				return;
			}

			let valText = after.sliceDoc(valueNode.from, valueNode.to);

			// qualifierValue exists but missing opening '('
			if (!valText.startsWith('(')) {
				changes.push({ from: valueNode.from, insert: '(' });
				valText = after.sliceDoc(valueNode.from + 1, valueNode.to + 1);
			}

			// qualifierValue exists but missing closing ')'
			if (!valText.endsWith(')')) {
				changes.push({ from: valueNode.to, insert: ')' });
			}
		}
	});

	if (!changes.length) return tr;

	return [
		tr,
		{
			changes,
			sequential: true,
			selection,
			userEvent: 'input.complete'
		}
	];
};

/**
 * If a Qualifier cease to exist as a result of transaction,
 * remove the qualifierValue enclosing group
 */
export const removeQValueGroup = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
	if (!tr.isUserEvent('input') && !tr.isUserEvent('delete')) {
		return tr;
	}

	const start = tr.startState;
	const after = tr.state;
	const startTree = syntaxTree(start);
	const afterTree = syntaxTree(after);

	const removals: { from: number; to: number }[] = [];

	startTree.iterate({
		enter(node) {
			if (node.name !== 'Qualifier') return;

			// if this qualifier still exists in the afterTree, skip
			const maybeQualifier = afterTree.resolve(node.from, 1);
			for (let cur: SyntaxNode | null = maybeQualifier; cur; cur = cur.parent) {
				if (cur.name === 'Qualifier') {
					return;
				}
			}

			const groupNode = node.node.getChild('QualifierValue')?.getChild('Group');
			// no enclosing group to remove
			if (!groupNode) return;

			const valueText = start.sliceDoc(groupNode.from, groupNode.to);
			if (!valueText.startsWith('(') || !valueText.endsWith(')')) return;

			// map group positions into the "after" document space
			const openPos = tr.changes.mapPos(groupNode.from, 1);
			const closePos = tr.changes.mapPos(groupNode.to, -1);

			// sanity check — don’t remove if text is already gone
			const afterText = after.sliceDoc(openPos, closePos);
			if (!afterText.includes('(') && !afterText.includes(')')) return;

			// remove both parens
			removals.push({ from: openPos, to: openPos + 1 }); // '('
			removals.push({ from: closePos - 1, to: closePos }); // ')'
		}
	});

	if (!removals.length) return tr;

	return [
		tr,
		{
			changes: removals,
			sequential: true,
			userEvent: 'delete.complete'
		}
	];
};

/**
 * Add a wildcard to an empty enclosing Group. Remove wildcard when user starts typing
 */
// export const insertGroupWildcard = (tr: Transaction) => {
// 	if (!tr.changes || tr.changes.empty) return tr;
// 	if (
// 		!tr.isUserEvent('input') &&
// 		!tr.isUserEvent('delete')
// 	) {
// 		return tr;
// 	}

// 	const start = tr.startState;
// 	const state = tr.state;
// 	const head = state.selection.main.head;

// 	let changes = null;

// 	// Resolve the node at the cursor in the AFTER state
// 	const resolvedNode = syntaxTree(state).resolveInner(head, 0);
// 	const groupNode = getEnclosingGroup(resolvedNode);
// 	if (!groupNode) return tr;

// 	// Get the text of the group in start and after states
// 	const groupBefore = start.sliceDoc(groupNode.from, groupNode.to);
// 	const groupAfter = state.sliceDoc(groupNode.from, groupNode.to);

// 	// If the group contains only (*) and user types, remove the '*'
// 	if (groupBefore === '(*)') {
// 		changes = {
// 			changes: {
// 				from: groupNode.from + 1,
// 				to: groupNode.from + 2,
// 				insert: ''
// 			},
// 			sequential: true
// 		};
// 		return [tr, changes];
// 	}

// 	// If the group is empty after edits, insert '*' to maintain a valid enclosing group
// 	if (groupBefore !== '()' && groupAfter === '()') {
// 		changes = {
// 			changes: {
// 				from: groupNode.from + 1,
// 				to: groupNode.from + 1,
// 				insert: '*'
// 			},
// 			sequential: true,
// 			selection: { anchor: groupNode.from + 2 } // place cursor after '*'
// 		};
// 		return [tr, changes];
// 	}

// 	return tr;
// };

/**
 * When encountering a qValue outer () on backspace,
 * jump past it
 */
export const jumpPastParens = (tr: Transaction) => {
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
		// backspace after a group -> jump inside
		const resolvedBefore = syntaxTree(state).resolveInner(head, -1);
		const groupBefore = getEnclosingGroup(resolvedBefore);
		if (groupBefore && head === groupBefore.to) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: groupBefore.to - 1 },
				userEvent: 'select'
			};
		}

		// backspace at beginning of group -> jump outside
		const resolvedInside = syntaxTree(state).resolveInner(head, 0);
		const groupInside = getEnclosingGroup(resolvedInside);
		if (groupInside) {
			const openPos = groupInside.from;
			if (head === openPos + 1) {
				return {
					changes: [],
					sequential: true,
					selection: { anchor: openPos },
					userEvent: 'select'
				};
			}
		}
	}

	if (isDelete) {
		// delete before a group -> jump inside
		const resolvedAfter = syntaxTree(state).resolveInner(head, 1);
		const groupAfter = getEnclosingGroup(resolvedAfter);
		if (groupAfter && head === groupAfter.from) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: groupAfter.from + 1 },
				userEvent: 'select'
			};
		}

		// delete at end of group -> jump outside
		const resolvedInside = syntaxTree(state).resolveInner(head, 0);
		const groupInside = getEnclosingGroup(resolvedInside);
		if (groupInside && head === groupInside.to - 1) {
			return {
				changes: [],
				sequential: true,
				selection: { anchor: groupInside.to },
				userEvent: 'select'
			};
		}
	}

	return tr;
};

/**
 * Prevents dislocating the outer group by typing between the operator and group
 */
export const handleInputBeforeGroup = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
	if (!tr.isUserEvent('input') && !tr.isUserEvent('paste')) return tr;

	const start = tr.startState;
	const head = start.selection.main.head;

	// detect enclosing group directly after cursor
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
 * Get the enclosing qualifierValue group that this node belongs to.
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
