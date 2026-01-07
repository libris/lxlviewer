import { type Transaction, type TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { qualifierSemanticField } from './qualifierValidation.js';

/**
 * Prevent an atomic qualifier from breaking by inserting a space when typing before it,
 * or a space after when typing after it. Also move the cursor out when trapped inside of it.
 */
const insertSpaceAroundQualifier = (tr: Transaction) => {
	const isDelete = tr.isUserEvent('delete');
	const isInput = tr.isUserEvent('input');

	if (!tr.docChanged || (!isInput && !isDelete)) return tr;

	const { atomicRanges } = tr.startState.field(qualifierSemanticField);

	let insert: TransactionSpec | TransactionSpec[] = [tr];

	const inputLength = tr.changes.desc.newLength - tr.changes.desc.length;
	const oldPos = Math.max(tr.startState.selection.main.anchor, tr.startState.selection.main.head);
	const newPos = oldPos + inputLength;
	const min = Math.min(oldPos, newPos);
	const max = Math.max(oldPos, newPos);

	atomicRanges.between(min, max, (from, to) => {
		const input = tr.newDoc.slice(oldPos, newPos).toString().trim();
		const prevChar = tr.newDoc
			.slice(min - 1, min)
			.toString()
			.trim();
		const nextChar = tr.newDoc
			.slice(max - 1, max)
			.toString()
			.trim();

		if (oldPos === from && (input || (isDelete && prevChar))) {
			insert = [
				tr,
				{
					changes: { from: newPos, insert: ' ' },
					sequential: true,
					selection: { anchor: newPos }
				}
			];
		} else if (oldPos >= from && oldPos <= to && newPos !== from) {
			const node = syntaxTree(tr.startState).resolveInner(oldPos, -1);
			if (node.parent?.name === 'QualifierValue') {
				insert = [
					tr,
					{
						changes: { from: min, to: max, insert: '' },
						sequential: true
					},
					{
						changes: { from: to, insert: ` ${input}` },
						selection: { anchor: to + (input ? inputLength + 1 : 1) }
					}
				];
			}
		} else if (newPos === to && isDelete && nextChar) {
			insert = [{ changes: { from: to, insert: ' ' } }, tr];
		}

		return false;
	});

	return insert;
};

export default insertSpaceAroundQualifier;
