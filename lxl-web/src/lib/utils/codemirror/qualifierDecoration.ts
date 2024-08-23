import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	ViewUpdate,
	type DecorationSet
} from '@codemirror/view';

const qualifierMatcher = new MatchDecorator({
	regexp: /(?<!\S+)(")?([a-zA-ZäöåÄÖÅ:]+)\1:/g,
	decoration: () =>
		Decoration.mark({
			class: 'lxlquery-qualifier'
		})
});

const qualifierDecoration = ViewPlugin.fromClass(
	class {
		qualifiers: DecorationSet;
		constructor(view: EditorView) {
			this.qualifiers = qualifierMatcher.createDeco(view);
		}
		update(update: ViewUpdate) {
			this.qualifiers = qualifierMatcher.updateDeco(update, this.qualifiers);
		}
	},
	{
		decorations: (instance) => instance.qualifiers
	}
);

export default qualifierDecoration;
