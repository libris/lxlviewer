import {
	Decoration,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	type DecorationSet
} from '@codemirror/view';
import { type Range } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { Prec } from '@codemirror/state';

/**
 * Adds mark decoration for error nodes or their parent if zero length
 */
function addHighlights(view: EditorView) {
	const widgets: Range<Decoration>[] = [];

	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (node.type.isError) {
					let { from, to } = node;
					if (node.from === node.to && node.node.parent) {
						from = node.node.parent.from;
						to = node.node.parent.to;
					}
					const invalidMark = Decoration.mark({ class: 'lxl-invalid', inclusive: true });
					widgets.push(invalidMark.range(from, to));
				}
			}
		});
	}
	return Decoration.set(widgets, true);
}

const queryLinter = ViewPlugin.fromClass(
	class {
		highlights: DecorationSet;

		constructor(view: EditorView) {
			this.highlights = addHighlights(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
				this.highlights = addHighlights(update.view);
			}
		}
	},
	{
		decorations: (v) => v.highlights
	}
);

const lxlLinter = Prec.low(queryLinter);

export default lxlLinter;
