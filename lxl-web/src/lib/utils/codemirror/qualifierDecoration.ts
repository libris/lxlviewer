import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	ViewUpdate,
	type DecorationSet
} from '@codemirror/view';

const qualifierNameMatcher = new MatchDecorator({
	regexp: /(?<!\S+)(")?([0-9a-zA-ZaåöAÅÖ]+):/g,
	decoration: () =>
		Decoration.mark({
			class: 'lxlquery-qualifier-name'
		})
});

export const qualifierNameDecoration = ViewPlugin.fromClass(
	class {
		qualifiers: DecorationSet;
		constructor(view: EditorView) {
			this.qualifiers = qualifierNameMatcher.createDeco(view);
		}
		update(update: ViewUpdate) {
			this.qualifiers = qualifierNameMatcher.updateDeco(update, this.qualifiers);
		}
	},
	{
		decorations: (instance) => instance.qualifiers
	}
);

const qualifierValueMatcher = new MatchDecorator({
	regexp: /(?<=(?<!\S+)(")?([0-9a-zA-ZaåöAÅÖ]+):)(\S+)/g,
	decoration: () =>
		Decoration.mark({
			class: 'lxlquery-qualifier-value'
		})
});

export const qualifierValueDecoration = ViewPlugin.fromClass(
	class {
		qualifiers: DecorationSet;
		constructor(view: EditorView) {
			this.qualifiers = qualifierValueMatcher.createDeco(view);
		}
		update(update: ViewUpdate) {
			this.qualifiers = qualifierValueMatcher.updateDeco(update, this.qualifiers);
		}
	},
	{
		decorations: (instance) => instance.qualifiers
	}
);
