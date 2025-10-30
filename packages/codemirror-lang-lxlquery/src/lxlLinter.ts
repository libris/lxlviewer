import {
	Decoration,
	EditorView,
	ViewPlugin,
	type ViewUpdate,
	type DecorationSet
} from '@codemirror/view';
import { type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { Prec } from '@codemirror/state';

/**
 * Adds mark decorations for invalid query nodes
 */
function findErrors(view: EditorView) {
	const widgets: Range<Decoration>[] = [];
	const invalidMark = Decoration.mark({ class: 'lxl-invalid', inclusive: true });

	if (!view.state.doc.toString().trim()) {
		// if doc is only whitespace, don't highlight any error
		// (we prevent submit anyway)
		return Decoration.none;
	}

	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (node.type.isError) {
					let { from, to } = node;
					let n = node.node;

					while (from === to && n.parent) {
						// if error node is zero-length
						// iterate the tree backwards until we find a visible parent to mark
						n = n.parent;
						from = n.from;
						to = n.to;
					}
					widgets.push(invalidMark.range(from, to));
				}

				// A qualifier within a qualifier passes parsing but should be considered bad query
				// See https://github.com/libris/librisxl/blob/develop/whelk-core/src/main/groovy/whelk/search2/parse/Analysis.java#L11
				if (node.name === 'Qualifier') {
					let n = node.node;
					while (n && n.parent) {
						n = n.parent;
						if (n.name === 'Qualifier') {
							widgets.push(invalidMark.range(node.from, node.to));
							break;
						}
					}
				}
			}
		});
	}
	return Decoration.set(widgets, true);
}

const queryLinter = ViewPlugin.fromClass(
	class {
		errors: DecorationSet;

		constructor(view: EditorView) {
			this.errors = findErrors(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
				this.errors = findErrors(update.view);
			}
		}
	},
	{
		decorations: (v) => v.errors
	}
);

const lxlLinter = Prec.default(queryLinter);

export default lxlLinter;
