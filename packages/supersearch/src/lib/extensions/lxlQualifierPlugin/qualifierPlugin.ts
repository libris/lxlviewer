// import type { SyntaxNode } from '@lezer/common';
// import { EditorView, type ViewUpdate, type DecorationSet } from '@codemirror/view';
// import { syntaxTree } from '@codemirror/language';
// import { qualifierValidatorFacet } from './qualifierFacet.js';
// import type { StateEffect } from '@codemirror/state';
// import { messages } from '$lib/constants/messages.js';
// import { sendMessage } from '$lib/utils/sendMessage.js';
// import { setQualifierSemantic } from './qualifierValidation.js';
// import type { QualifierSemantic, QualifierValidator } from '$lib/types/lxlQualifierPlugin.js';
// import { addQualifiers } from './qualifierDecorations.js';

// export class LxlQualifier {
//   decorations: DecorationSet

//   constructor(view: EditorView) {
//     this.decorations = addQualifiers(view)
//   }

//   update(update: ViewUpdate) {
//     for (const tr of update.transactions) {
//       if (tr.effects.some(e => e.is(setQualifierSemantic))) {
//         this.decorations = addQualifiers(update.view)
//         break
//       }
//     }
//   }
// }

// export class LxlQualifier {
// 	decorations: DecorationSet;

// 	constructor(view: EditorView) {
// 		this.decorations = addQualifiers(view);
// 	}
// 	update(update: ViewUpdate) {
// 		let shouldRevalidate = update.docChanged;

// 		if (!shouldRevalidate) {
// 			for (const tr of update.transactions) {
// 				for (const e of tr.effects) {
// 					if (e.is(sendMessage) && e.value.message === messages.NEW_DATA) {
// 						console.log('new data');
// 						shouldRevalidate = true;
// 					}
// 					if (e.is(setQualifierSemantic)) {
// 						console.log('statefield update effect');
// 						this.decorations = addQualifiers(update.view);
// 					}
// 				}
// 			}
// 		}

// 		if (shouldRevalidate) {
// 			this.schedule(update.view);
// 		}
// 	}
// 	private scheduled = false;

// 	schedule(view: EditorView) {
// 		if (this.scheduled) return;
// 		this.scheduled = true;

// 		queueMicrotask(() => {
// 			this.scheduled = false;
// 			this.runValidation(view);
// 		});
// 	}
// 	runValidation(view: EditorView) {
// 		const validator = view.state.facet(qualifierValidatorFacet);
// 		if (!validator) return;

// 		const effects: StateEffect<QualifierSemantic>[] = [];

// 		syntaxTree(view.state).iterate({
// 			enter: (node) => {
// 				if (node.name !== 'Qualifier') return;

// 				const semantic = computeQualifierSemantic(node.node, view, validator);
// 				effects.push(setQualifierSemantic.of(semantic));
// 			}
// 		});

// 		if (effects.length) {
// 			view.dispatch({ effects });
// 		}
// 	}
// }

// function computeQualifierSemantic(
// 	node: SyntaxNode,
// 	view: EditorView,
// 	validate: QualifierValidator
// ): QualifierSemantic {
// 	const keyNode = node.getChild('QualifierKey');
// 	const valueNode = node.getChild('QualifierValue');

// 	const keyText = keyNode ? view.state.doc.sliceString(keyNode.from, keyNode.to) : '';

// 	const valueText = valueNode
// 		? view.state.doc.sliceString(valueNode.from, valueNode.to)
// 		: undefined;

// 	const semantic = validate(keyText, valueText);

// 	return {
// 		...semantic,
// 		key: keyText,
// 		node
// 	};
// }

// function shallowEqual(a: QualifierSemantic | undefined, b: QualifierSemantic): boolean {
// 	if (a === b) return true;
// 	if (!a) return false;

// 	return (
// 		a.invalid === b.invalid &&
// 		a.keyLabel === b.keyLabel &&
// 		a.valueLabel === b.valueLabel &&
// 		a.removeLink === b.removeLink
// 		// a.atomicFrom === b.atomicFrom &&
// 		// a.atomicTo === b.atomicTo
// 	);
// }
