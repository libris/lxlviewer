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
 * Adds mark decorations to syntax nodes for styling purposes
 */
function addDecoration(view: EditorView) {
	const widgets: Range<Decoration>[] = [];
	const notMark = Decoration.mark({ class: 'lxl-not-term', inclusive: true });

	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (node.name === 'UTerm') {
					widgets.push(notMark.range(node.from, node.to));
				}
			}
		});
	}
	return Decoration.set(widgets, true);
}

const queryHighlight = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = addDecoration(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
				this.decorations = addDecoration(update.view);
			}
		}
	},
	{
		decorations: (v) => v.decorations
	}
);

const lxlHighlight = Prec.low(queryHighlight);

export default lxlHighlight;
