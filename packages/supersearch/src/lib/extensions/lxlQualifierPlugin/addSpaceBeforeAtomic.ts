// import { Transaction, type TransactionSpec } from '@codemirror/state';
// import { syntaxTree } from '@codemirror/language';

/**
 * Moves cursor into an empty quote on falsy qualifier value
 */
// const insertQuotes = (tr: Transaction) => {
// 	let foundEmptyQValue = false;
// 	const changes: TransactionSpec = {
// 		changes: {
// 			from: tr.state.selection.main.head,
// 			to: tr.state.selection.main.head,
// 			insert: '""'
// 		},
// 		sequential: true,
// 		selection: { anchor: tr.state.selection.main.head + 1 }
// 	};
// 	syntaxTree(tr.state).iterate({
// 		enter: (node) => {
// 			if (node.name === 'Qualifier') {
// 				const qValue = node.node.getChild('QualifierValue');
// 				if (!qValue && tr.isUserEvent('input')) {
// 					foundEmptyQValue = true;
// 					return true;
// 				}
// 			}
// 		}
// 	});
// 	return foundEmptyQValue ? [tr, changes] : tr;
// };

// const addSpaceBeforeAtomic = (tr: Transaction) => {
//   if (!tr.docChanged) {
//     return tr
//   } else {
//     tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
//       const contentBefore = tr.startState.sliceDoc(0, fromA);
//       const contentAfter = tr.startState.sliceDoc(toA);
//       // console.log(fromA, toA, fromB, toB, inserted)
//       console.log(tr.startState.facet(atomicRanges))
//     })
//   }
//   return tr
// }

// export default addSpaceBeforeAtomic;

// RangeSet.between(
// from: number,
// to: number,
// f: fn(from: number, to: number, value: T) → false | undefined
// )

// import { EditorState, Prec } from '@codemirror/state';
// import { QUALIFIER_REGEXP } from '$lib/utils/codemirror/extensions/qualifierWidgets';

// const ENDS_WITH_WHITESPACE = new RegExp(/\s$/);
// const BEGINS_WITH_WHITESPACE = new RegExp(/^\s/);

// /**
//  * Prevents existing qualifier widgets to be edited if inserting a character before them (by adding an extra whitespace after the inserted character)
//  */

// const preventInsertBeforeQualifier = Prec.highest(
// 	EditorState.transactionFilter.of((tr) => {
// 		if (!tr.docChanged) {
// 			return tr;
// 		}

// 		let insertSpacePos: number | undefined;

// 		tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
// 			const contentBefore = tr.startState.sliceDoc(0, fromA);
// 			const contentAfter = tr.startState.sliceDoc(toA);
// 			if (
// 				inserted.length &&
// 				(fromA === 0 || ENDS_WITH_WHITESPACE.test(contentBefore)) && // test if editing the beginning of the string or if there is a whitespace before the inserted characters
// 				!ENDS_WITH_WHITESPACE.test(inserted.toString()) && // only proceed if inserted content doesn't end with a whitespace
// 				QUALIFIER_REGEXP.test(contentAfter) && // test if inserted character is followed by a qualifier
// 				!BEGINS_WITH_WHITESPACE.test(contentAfter) // if we already inserted whitespace, we don't want to keep doing it
// 			) {
// 				insertSpacePos = toB;
// 			}
// 		});

// 		if (insertSpacePos) {
// 			return [
// 				tr,
// 				{
// 					changes: {
// 						from: insertSpacePos,
// 						insert: ' '
// 					},
// 					sequential: true
// 				}
// 			];
// 		} else return [tr];
// 	})
// );

// export default preventInsertBeforeQualifier;
