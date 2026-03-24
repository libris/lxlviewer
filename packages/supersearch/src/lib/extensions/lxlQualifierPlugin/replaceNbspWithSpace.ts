import { Transaction } from '@codemirror/state';

/**
 * This is (a not so elegant) fix for the issue with nbsp characters appearing after qualifiers, (resulting in following pills after the first to not appear)
 */
export const replaceNbspWithSpace = (tr: Transaction) => {
	if (!tr.annotation(Transaction.userEvent)) {
		return tr;
	}
	if (
		!tr.docChanged ||
		tr.isUserEvent('select') ||
		tr.isUserEvent('undo') ||
		tr.isUserEvent('redo')
	) {
		return tr;
	}

	const doc = tr.newDoc.toString();
	const docWithoutNbsp = doc.replaceAll(/\u00A0/g, ' ');

	return [
		tr,
		{
			changes: [
				{
					from: 0,
					to: doc.length,
					insert: docWithoutNbsp
				}
			],
			selection: tr.newSelection,
			sequential: true,
			userEvent: 'input'
		}
	];
};

export default replaceNbspWithSpace;
