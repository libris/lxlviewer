import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

// ghostGroup refers to an outer enclosing group of the qualifier value that
// will be hidden to the user and that have to appear, be maintained and disappear automatically

/**
 * QualifierValue's first child must be a Group.
 * If not - add/repair it. Exception: quoted qualifier values
 */
export const enforceGhostGroup = (tr: Transaction) => {
	if (!tr.isUserEvent('input') && !tr.isUserEvent('delete')) {
		return tr;
	}

	const start = tr.startState;
	const after = tr.state;

	const from = start.selection.main.from;
	const to = start.selection.main.to;

	const nodeAtHead = syntaxTree(start).resolveInner(from, 0);
	const ghostGroup = getGhostGroup(nodeAtHead);

	// don't touch other groups within the ghost group
	if (ghostGroup && from > ghostGroup.from && to < ghostGroup.to) {
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
 * If a Qualifier ceases to exist as a result of the transaction,
 * remove the qualifierValue ghost group.
 */
export const removeGhostGroup = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
	if (!tr.isUserEvent('input') && !tr.isUserEvent('delete')) return tr;

	const start = tr.startState;
	const after = tr.state;
	const startTree = syntaxTree(start);
	const afterTree = syntaxTree(after);

	const removals: { from: number; to: number }[] = [];

	startTree.iterate({
		enter(node) {
			if (node.name !== 'Qualifier') return;

			// map approximate qualifier position into new document
			const mappedFrom = tr.changes.mapPos(node.from, 1);
			const mappedTo = tr.changes.mapPos(node.to, -1);

			// look for any remaining Qualifier overlapping this region
			let stillExists = false;
			afterTree.iterate({
				from: mappedFrom,
				to: mappedTo,
				enter(inner) {
					if (inner.name === 'Qualifier') {
						stillExists = true;
						return false; // stop scanning
					}
				}
			});
			if (stillExists) return;

			// qualifier is gone, check if it has a ghost group to remove
			const ghostGroup = node.node.getChild('QualifierValue')?.getChild('Group');
			if (!ghostGroup) return;

			const valueText = start.sliceDoc(ghostGroup.from, ghostGroup.to);
			if (!valueText.startsWith('(') || !valueText.endsWith(')')) return;

			// map group positions into the "after" document
			const openPos = tr.changes.mapPos(ghostGroup.from, 1);
			const closePos = tr.changes.mapPos(ghostGroup.to, -1);

			if (after.sliceDoc(openPos, openPos + 1) === '(') {
				removals.push({ from: openPos, to: openPos + 1 });
			}
			if (after.sliceDoc(closePos - 1, closePos) === ')') {
				removals.push({ from: closePos - 1, to: closePos });
			}
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
 * Add a wildcard to an empty ghost group. Remove wildcard when user starts typing
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
// 	const groupNode = getQualifierValueGroup(resolvedNode);
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
 * When encountering a ghost group edge on backspace, jump past it
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
		const groupBefore = getGhostGroup(resolvedBefore);
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
		const groupInside = getGhostGroup(resolvedInside);
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
		const groupAfter = getGhostGroup(resolvedAfter);
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
		const groupInside = getGhostGroup(resolvedInside);
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
 * Prevents dislocating the ghost group by typing between the operator and group
 */
export const handleInputBeforeGroup = (tr: Transaction) => {
	if (!tr.changes || tr.changes.empty) return tr;
	if (!tr.isUserEvent('input') && !tr.isUserEvent('paste')) return tr;

	const start = tr.startState;
	const head = start.selection.main.head;

	// detect ghost group directly after cursor
	const nodeAfter = syntaxTree(start).resolveInner(head, +1);
	const ghostGroup = getGhostGroup(nodeAfter);
	if (!ghostGroup) return tr;

	if (head !== ghostGroup.from) return tr;

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
 * If a node belongs to a qualifier value ghost group, return the group.
 */
function getGhostGroup(node: SyntaxNode): SyntaxNode | false {
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
