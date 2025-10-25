import { Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

export const enforceQualifierGroups = (tr: Transaction) => {
	// Only run on relevant user events
	if (
		!tr.isUserEvent('input') &&
		!tr.isUserEvent('paste') &&
		!tr.isUserEvent('delete') &&
		!tr.isUserEvent('delete.backward') &&
		!tr.isUserEvent('delete.forward')
	) {
		return tr;
	}

	// const start = tr.startState;
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

			// Skip quoted values
			if (valueNode) {
				const valText = after.sliceDoc(valueNode.from, valueNode.to);
				if (valText.startsWith('"') && valText.endsWith('"')) {
					// Quoted value detected, do nothing
					return;
				}
			}

			// Missing QualifierValue → insert (*) and jump inside
			if (!valueNode) {
				changes.push({ from: opEnd, insert: '(*)' });
				selection = { anchor: opEnd + 2 }; // cursor after '('
				return;
			}

			const valText = after.sliceDoc(valueNode.from, valueNode.to);

			// QualifierValue exists but missing opening '('
			if (!valText.startsWith('(')) {
				changes.push({ from: valueNode.from, insert: '(' });
			}

			// CASE 3: QualifierValue exists but missing closing ')'
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
