import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

// ghostGroup refers to an outer enclosing group of the qualifier value (exported from grammar as QualifierOuterGroup)
// It will hidden to the user and have to appear, be maintained and disappear automatically

/**
 * QualifierValue's first child must be a QualifierOuterGroup.
 * If not - add/repair it. Exception: quoted qualifier values
 */
export const createGhostGroup = (tr: Transaction) => {
	if (!tr.docChanged || !tr.isUserEvent('input')) {
		return tr;
	}

	const changes: { from: number; to?: number; insert?: string }[] = [];
	let selection: { anchor: number } | undefined;

	const prevNode = syntaxTree(tr.state).resolveInner(tr.state.selection.main.head, -1);
	if (prevNode.name === 'QualifierOperator') {
		const operator = tr.state.sliceDoc(prevNode.from, prevNode.to);
		if (operator === ':' || operator === '=') {
			// insert group after typing equality operator
			changes.push({ from: prevNode.to, insert: '()' });
			selection = { anchor: prevNode.to + 1 };
		}
	} else {
		const currentNode = syntaxTree(tr.state).resolve(tr.state.selection.main.head, -1);
		const qualifierValue = getParent(currentNode, 'QualifierValue');

		if (qualifierValue && qualifierValue.node.firstChild?.name !== 'QualifierOuterGroup') {
			// we are editing a groupless qualifier value
			const operator = tr.state.sliceDoc(
				qualifierValue.node.prevSibling?.from,
				qualifierValue.node.prevSibling?.to
			);
			if (operator === ':' || operator === '=') {
				// if the operator is equality, add ()
				const { from, to } = qualifierValue;
				changes.push({ from, insert: '(' });
				changes.push({ from: to, insert: ')' });

				const offset = tr.state.selection.main.head + 1;
				selection = { anchor: offset };
			}
		}
	}

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
 * remove the group.
 */
export const removeGhostGroup = (tr: Transaction) => {
	if (!tr.docChanged || (!tr.isUserEvent('input') && !tr.isUserEvent('delete'))) return tr;

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

			// check if this qualifier still exists in the after tree
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
			const ghostGroup = node.node.getChild('QualifierValue')?.getChild('QualifierOuterGroup');
			if (!ghostGroup) return;

			const valueText = start.sliceDoc(ghostGroup.from, ghostGroup.to);
			if (!valueText.startsWith('(') || !valueText.endsWith(')')) return;

			// map group positions into the "after" document
			const openPos = tr.changes.mapPos(ghostGroup.from, 1);
			const closePos = tr.changes.mapPos(ghostGroup.to, -1);

			// remove parens
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
 * When encountering a ghost group edge on backspace, jump past it
 */
export const jumpPastParens = (tr: Transaction) => {
	const isBackspace = tr.isUserEvent('delete.backward');
	const isDelete = tr.isUserEvent('delete.forward');

	if (!tr.docChanged || (!isBackspace && !isDelete)) return tr;

	const state = tr.startState;
	const head = state.selection.main.head;

	if (state.selection.main.from !== state.selection.main.to) {
		return tr;
	}

	if (isBackspace) {
		// backspace after a group -> jump inside
		const resolvedBefore = syntaxTree(state).resolveInner(head, -1);
		const groupBefore = getParent(resolvedBefore, 'QualifierOuterGroup');
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
		const groupInside = getParent(resolvedInside, 'QualifierOuterGroup');
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
		const groupAfter = getParent(resolvedAfter, 'QualifierOuterGroup');
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
		const groupInside = getParent(resolvedInside, 'QualifierOuterGroup');
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
	if (!tr.docChanged || !tr.isUserEvent('input')) return tr;

	const start = tr.startState;
	const head = start.selection.main.head;

	// detect ghost group directly after cursor
	const nodeAfter = syntaxTree(start).resolveInner(head, +1);
	const ghostGroup = getParent(nodeAfter, 'QualifierOuterGroup');
	if (!ghostGroup) return tr;

	if (head !== ghostGroup.from) return tr;

	// shift text changes +1 position to the right
	const shiftedChanges: { from: number; to?: number; insert?: string }[] = [];
	let totalInsertedLength = 0;

	tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
		if (inserted.toString() === ')') {
			// don't shift ')' and break the group
			return;
		}
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
			userEvent: tr.annotation(Transaction.userEvent) || 'input.complete'
		}
	];
};

/**
 * Re-add parens on bulk changes (select - delete)
 * Prevents any following qualifiers being parsed as belonging to the same group...
 */
export const repairGhostGroup = (tr: Transaction) => {
	if (!tr.docChanged || (!tr.isUserEvent('delete') && !tr.isUserEvent('input'))) {
		return tr;
	}

	const start = tr.startState;
	const after = tr.state;
	const startTree = syntaxTree(start);
	const afterDoc = after.doc;

	const repairs: { from: number; insert: string }[] = [];

	tr.changes.iterChanges((fromA, toA) => {
		// only react to larger deletions (backspaces jumps over ')')
		if (toA - fromA <= 1) return;

		const deletedText = start.sliceDoc(fromA, toA);
		if (!deletedText.includes(')') && !deletedText.includes('(')) return;

		// Find if deleted parens belonged to a ghost group
		const nodeBefore = startTree.resolveInner(fromA, -1);
		const nodeAfter = startTree.resolveInner(toA, 1);

		const ghostGroup =
			getParent(nodeBefore, 'QualifierOuterGroup') || getParent(nodeAfter, 'QualifierOuterGroup');
		if (!ghostGroup) return;

		// Map ghost group to after-state
		const mappedFrom = tr.changes.mapPos(ghostGroup.from, 1);
		const mappedTo = tr.changes.mapPos(ghostGroup.to, -1);

		// Repair
		const openChar = afterDoc.sliceString(mappedFrom, mappedFrom + 1);
		if (openChar !== '(') repairs.push({ from: mappedFrom, insert: '(' });

		const closeChar = afterDoc.sliceString(mappedTo - 1, mappedTo);
		if (closeChar !== ')') repairs.push({ from: mappedTo, insert: ')' });
	});

	if (!repairs.length) return tr;

	return [
		tr,
		{
			changes: repairs,
			sequential: true,
			userEvent: 'input.complete'
		}
	];
};

/**
 * Prevents destroying the ghost group by typing ')' inside the group, parsed as end of group.
 * Or typing '(' which can interfere with succeeding qualifiers
 * Autocompletes ')' with '(' and reverse; removes any stray ')' when deleting '('.
 */
export const balanceInnerParens = (tr: Transaction) => {
	if (!tr.docChanged) return tr;

	const isInput = tr.isUserEvent('input');
	const isDelete = tr.isUserEvent('delete');
	if (!isInput && !isDelete) return tr;

	const edits: { from: number; to?: number; insert?: string }[] = [];
	let selection: { anchor: number } | undefined;

	const startTree = syntaxTree(tr.startState);
	const after = tr.state;

	tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
		const insertedText = inserted.toString();
		const deletedText = tr.startState.sliceDoc(fromA, toA);
		const parenChanged =
			insertedText.includes('(') ||
			insertedText.includes(')') ||
			deletedText.includes('(') ||
			deletedText.includes(')');
		if (!parenChanged) return;

		const node = startTree.resolveInner(fromA, 0);
		const ghostGroup = getParent(node, 'QualifierOuterGroup');
		if (!ghostGroup) return;

		const mappedFrom = tr.changes.mapPos(ghostGroup.from, 1);
		const mappedTo = tr.changes.mapPos(ghostGroup.to, -1);

		// only operate inside group
		if (fromB <= mappedFrom || fromB >= mappedTo) return;

		const innerFrom = mappedFrom + 1;
		const innerTo = mappedTo - 1;
		const afterContent = after.doc.sliceString(innerFrom, innerTo);

		const count = (text: string, char: string) =>
			(text.match(new RegExp(`\\${char}`, 'g')) || []).length;
		const afterOpen = count(afterContent, '(');
		const afterClose = count(afterContent, ')');

		// autocomplete '('
		if (isInput && insertedText.includes('(')) {
			const imbalance = afterOpen - afterClose;
			if (imbalance > 0) {
				const insertPos = fromB + insertedText.length;
				edits.push({ from: insertPos, insert: ')'.repeat(imbalance) });
			}
		}

		// autocomplete ')'
		if (isInput && insertedText.includes(')')) {
			const imbalance = afterClose - afterOpen;
			if (imbalance > 0) {
				const insertPos = fromB;
				edits.push({ from: insertPos, insert: '('.repeat(imbalance) });

				// single ')' -> move caret one step back inside the pair
				if (insertedText === ')') {
					const mappedCaret = tr.changes.mapPos(toB, 1);
					selection = { anchor: mappedCaret - 1 };
				}
			}
		}

		if (isDelete) {
			const deletedOpens = (deletedText.match(/\(/g) || []).length;
			const deletedCloses = (deletedText.match(/\)/g) || []).length;

			const afterInner = after.doc.sliceString(innerFrom, innerTo);
			const strayOpen = count(afterInner, '(');
			const strayClose = count(afterInner, ')');

			// remove stray ')'
			if (deletedOpens > deletedCloses && strayClose > strayOpen) {
				let toRemove = strayClose - strayOpen;
				let pos = innerTo;
				while (toRemove > 0 && pos > innerFrom) {
					pos--;
					if (after.doc.sliceString(pos, pos + 1) === ')') {
						edits.push({ from: pos, to: pos + 1 });
						toRemove--;
					}
				}
			}
			// remove stray '('
			if (deletedCloses > deletedOpens && strayOpen > strayClose) {
				let toRemove = strayOpen - strayClose;
				let pos = innerFrom;
				while (toRemove > 0 && pos < innerTo) {
					if (after.doc.sliceString(pos, pos + 1) === '(') {
						edits.push({ from: pos, to: pos + 1 });
						toRemove--;
					}
					pos++;
				}
			}
		}
	});

	if (!edits.length) return tr;

	return [
		tr,
		{
			changes: edits,
			sequential: true,
			userEvent: 'input.complete',
			selection
		}
	];
};

/**
 * If a node belongs to a named parent, return the parent.
 */
function getParent(node: SyntaxNode, name: string): SyntaxNode | false {
	if (!node || !name) return false;

	let current: SyntaxNode | null = node;

	while (current && current.name !== name) {
		current = current.parent;
	}

	return current?.name === name ? current : false;
}

/**
 * Returns true if the node is covered by an atomic range
 */
// function isValidQualifier(node: SyntaxNode, atomicRanges: RangeSet<RangeValue>): boolean {
// 	let containsAtomic = false;

// 	atomicRanges.between(node.from, node.to, (start, end) => {
// 		// True overlap (not just touching)
// 		if (node.from < end && start < node.to) {
// 			containsAtomic = true;
// 			return false;
// 		}
// 	});

// 	return containsAtomic;
// }
