import { EditorState, Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { qualifierStateField } from './qualifierValidation.js';
import { startEditingQualifier, stopEditingQualifier } from './qualifierEffects.js';
import { env } from '$env/dynamic/public';

// ghostGroup refers to an outer enclosing group of the qualifier value (exported from grammar as QualifierOuterGroup)
// It will hidden to the user and have to appear, be maintained and disappear automatically

/**
 * QualifierValue's first child must be a QualifierOuterGroup.
 * If not - add/repair it. Exception: quoted qualifier values
 */
export const createGhostGroup = (tr: Transaction) => {
	// don't run on edit qualifier start/stop events
	for (const e of tr.effects) {
		if (e.is(stopEditingQualifier) || e.is(startEditingQualifier)) {
			return tr;
		}
	}
	// run on valdation change -> atomic range change
	const rangesChanged =
		tr.startState.field(qualifierStateField).atomicRanges.size !==
		tr.state.field(qualifierStateField).atomicRanges.size;

	if (!tr.isUserEvent('input') && !rangesChanged) {
		return tr;
	}

	const changes: { from: number; to?: number; insert?: string }[] = [];
	let selection: { anchor: number } | undefined;

	const prevNode = syntaxTree(tr.state).resolveInner(tr.state.selection.main.head, -1);

	// validate qualifier
	const validQualifier = getValidQualifier(tr.state, prevNode);
	if (!validQualifier) return tr;

	// check if in edit mode
	if (isEditingQualifier(tr.state, prevNode)) return tr;

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

			// validate qualifier
			const validQualifier = getValidQualifier(tr.startState, node.node);
			if (!validQualifier) return;

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

function debugLog(message: unknown) {
	if (env.PUBLIC_DEBUG_GHOST_GROUP && env.PUBLIC_DEBUG_GHOST_GROUP.toLowerCase() === 'true') {
		console.log('DEBUG GHOST GROUP:', (message as object).toString());
	}
}

export const handleChangesInGhostGroup = (tr: Transaction) => {
	// Ensure the transaction is the result of direct user input (Transaction.isUserEvent only checks for a specific user event type while checking the annotation directly allows for any type of user event)
	if (!tr.annotation(Transaction.userEvent)) {
		return tr;
	}
	if (
		!tr.docChanged ||
		tr.isUserEvent('select') ||
		tr.isUserEvent('undo') ||
		tr.isUserEvent('redo')
	)
		return tr;

	const tree = syntaxTree(tr.startState);

	const groupAtAnchor = getParent(
		tree.resolveInner(tr.startState.selection.main.anchor),
		'QualifierOuterGroup'
	);

	const groupAtHead = getParent(
		tree.resolveInner(tr.startState.selection.main.head),
		'QualifierOuterGroup'
	);

	const groupAfterAnchor = getParent(
		tree.resolveInner(tr.startState.selection.main.anchor, 1),
		'QualifierOuterGroup'
	);

	const groupBeforeAnchor = getParent(
		tree.resolveInner(tr.startState.selection.main.anchor, -1),
		'QualifierOuterGroup'
	);

	const groupBeforeHead = getParent(
		tree.resolveInner(tr.startState.selection.main.head, -1),
		'QualifierOuterGroup'
	);

	const groupAfterHead = getParent(
		tree.resolveInner(tr.startState.selection.main.head, 1),
		'QualifierOuterGroup'
	);

	if (tr.startState.selection.main.empty) {
		if (
			groupAfterAnchor &&
			!groupAtAnchor &&
			!groupAtHead &&
			tr.newDoc.slice(tr.newSelection.main.from - 1, tr.newSelection.main.from).toString() === '('
		) {
			debugLog('remove newly added opening parens');
			return [
				tr,
				{
					changes: {
						from: tr.newSelection.main.from - 1,
						to: tr.newSelection.main.from,
						insert: ''
					},
					selection: { anchor: tr.newSelection.main.from },
					sequential: true,
					userEvent: 'input'
				}
			];
		}

		if (
			groupAfterAnchor &&
			!groupAtAnchor &&
			!groupAtHead &&
			tr.newDoc.slice(tr.newSelection.main.from - 1, tr.newSelection.main.from).toString() === ')'
		) {
			debugLog('add new group if closing parenthesis is inserted before group');
			return [
				tr,
				{
					changes: [
						{
							from: tr.newSelection.main.from,
							insert: ' '
						},
						{
							from: tr.newSelection.main.from - 1,
							insert: '('
						}
					],
					selection: { anchor: tr.newSelection.main.from },
					sequential: true,
					userEvent: 'input'
				}
			];
		}

		if (
			groupAfterAnchor &&
			!groupAtAnchor &&
			tr.startState.sliceDoc(0, tr.startState.selection.main.from).toString() ===
				tr.newDoc.sliceString(0, tr.startState.selection.main.from)
		) {
			debugLog('Add space after insert and remove newly added parens');
			return [
				tr,
				{
					changes: [
						{
							from: tr.newSelection.main.head,
							to: tr.newSelection.main.head + 2,
							insert: ' '
						}
					],
					sequential: true,
					userEvent: 'input'
				}
			];
		}
		return tr;
	}

	if (
		groupAtAnchor &&
		groupAtHead &&
		groupAtAnchor.from === groupAtHead.from &&
		groupAtAnchor.to === groupAtHead.to
	) {
		debugLog("Don't do anything as changes are made inside the same group");
		return tr;
	}

	if (
		!groupAtAnchor &&
		!groupAtHead &&
		((groupBeforeAnchor && !groupBeforeHead) || (groupAfterAnchor && !groupAfterHead)) &&
		tr.newDoc.length ===
			tr.startState.doc.length -
				(tr.startState.selection.main.to - tr.startState.selection.main.from)
	) {
		debugLog('Re-add parens as entire group was removed');
		return [
			tr,
			{
				changes: [
					{
						from: tr.newSelection.main.from,
						insert: '()'
					}
				],
				sequential: true,
				selection: { anchor: tr.newSelection.main.from + 1 },
				userEvent: 'input'
			}
		];
	}

	if (!groupAtAnchor && !groupAtHead && groupAfterHead) {
		debugLog('Remove parentheses before-hand');
		return [
			{
				changes: [
					{
						from: tr.startState.selection.main.from,
						to: tr.startState.selection.main.from + 1,
						insert: ''
					},
					{
						from: tr.startState.selection.main.to - 1,
						to: tr.startState.selection.main.to,
						insert: ''
					}
				],
				sequential: true,
				userEvent: 'input'
			},
			tr
		];
	}

	if (groupAtAnchor && groupAtAnchor.to < tr.startState.selection.main.to) {
		if (groupAfterHead) {
			debugLog(
				'Remove following closing parenthesis as selection is done rightward and selection head is followed directly by another ghost group'
			);
			return [
				tr,
				{
					changes: [
						{ from: tr.newSelection.main.from, to: tr.newSelection.main.from + 1, insert: ' ' }
					],
					sequential: true,
					userEvent: 'input'
				}
			];
		} else if (groupAtHead && groupAtHead.from < tr.startState.selection.main.to) {
			debugLog('Is this needed?');
			return tr;
		} else {
			debugLog(
				'Insert a closing parenthesis as selection is done rightward and selection head is outside ghost group'
			);

			return [
				tr,
				{
					changes: [{ from: tr.newSelection.main.to, insert: ')' }],
					sequential: true,
					userEvent: 'input'
				}
			];
		}
	}
	if (groupAtAnchor && groupAtAnchor.from < tr.startState.selection.main.from) {
		debugLog(
			'Insert a closing parenthesis as selection is done rightward and selection anchor is outside ghost group'
		);
		return [
			tr,
			{
				changes: [{ from: tr.newSelection.main.to, insert: ')' }],
				sequential: true,
				userEvent: 'input'
			}
		];
	}

	if (
		groupAtAnchor &&
		!groupAtHead &&
		groupAtAnchor.from > tr.startState.selection.main.from &&
		!groupAfterHead
	) {
		debugLog(
			'Remove opening parenthesis in anchor group as selection is done leftward and selection head is outside group.'
		);
		return [
			{
				changes: [{ from: groupAtAnchor.to - 1, to: groupAtAnchor.to, insert: '' }],
				sequential: true,
				userEvent: 'input'
			},
			tr
		];
	}

	if (groupAtAnchor && !groupAtHead && !groupAfterHead) {
		debugLog('Insert an opening parenthesis .... ');
		return [
			tr,
			{
				changes: [{ from: tr.newSelection.main.from, insert: '(' }],
				sequential: true,
				userEvent: 'input'
			}
		];
	}

	if (!groupAtAnchor && groupAfterAnchor && groupAtHead) {
		debugLog('Editing from start of group to inside of head, space is added after');
		return [
			tr,
			{
				changes: [{ from: tr.newSelection.main.to, to: tr.newSelection.main.to + 1, insert: '' }],
				sequential: true,
				userEvent: 'delete'
			}
		];
	}

	if (groupAtHead && !groupAtAnchor && groupAtHead.from <= tr.startState.selection.main.from) {
		debugLog('Add a closing parenthesis!');
		return [
			tr,
			{
				changes: [{ from: tr.newSelection.main.to, insert: ')' }],
				sequential: true,
				userEvent: 'input'
			}
		];
	}

	return tr;
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

export function isValidQualifier(state: EditorState, node: SyntaxNode | false): boolean {
	if (!node || node.name !== 'Qualifier') return false;

	const stateField = state.field(qualifierStateField);
	const key = `${node.from}-${node.to}`;

	const qualifier = stateField.qualifiers.get(key);
	return !!qualifier && !qualifier.invalid;
}

const getValidQualifier = (state: EditorState, node: SyntaxNode) => {
	const parent = getParent(node, 'Qualifier');
	return parent && isValidQualifier(state, parent.node) ? parent : null;
};

export const isEditingQualifier = (state: EditorState, node: SyntaxNode) => {
	const { editing } = state.field(qualifierStateField);
	if (!editing) return false;

	const parent = getParent(node, 'Qualifier');
	if (!parent) return false;

	return parent.node.from === editing.from;
};
