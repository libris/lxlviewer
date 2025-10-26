import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * QualifierOperator:s first sibling must be a QualifierValue,
 * and that QualifierValue's first child must be a Group. If it is not - fix it.
 * Exception quoted qualifier values
 */
export const enforceQualifierGroups = (tr: Transaction) => {
	if (
		!tr.isUserEvent('input') &&
		!tr.isUserEvent('paste') &&
		!tr.isUserEvent('delete') &&
		!tr.isUserEvent('delete.backward') &&
		!tr.isUserEvent('delete.forward')
	) {
		return tr;
	}

	const after = tr.state;
	const tree = syntaxTree(after);

	const changes: { from: number; to?: number; insert?: string }[] = [];
	let selection: { anchor: number } | undefined;

	tree.iterate({
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

			// missing QualifierValue → insert (*) and jump inside
			if (!valueNode) {
				// changes.push({ from: opEnd, insert: '(*)' });
				// selection = { anchor: opEnd + 2 };
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
			userEvent: 'input.repair'
		}
	];
};
