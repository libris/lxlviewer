import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	type ViewUpdate,
	type DecorationSet
} from '@codemirror/view';

const qualifierMatcher = new MatchDecorator({
	regexp:
		/(?<=^|\s)(?<qualifierType>("[0-9a-zA-ZåäöÅÄÖ:]+")|([0-9a-zA-ZåäöÅÄÖ:]+)):(?<qualifierValue>("[^"]*"|[0-9a-zA-ZåäöÅÄÖ:%#".-]+))/g,
	decoration: () =>
		Decoration.mark({
			class: 'lxlquery-qualifier-unlinked'
		})
});

export const qualifierDecoration = ViewPlugin.fromClass(
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

const qualifierNameMatcher = new MatchDecorator({
	regexp: /(?<!\S+)((")?([0-9a-zA-ZåäöÅÄÖ:]+)\2):/g,
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
	regexp: /(?<=(?<!\S+)([0-9a-zA-ZåäöÅÄÖ:"]+):)((")?[0-9a-zA-ZåäöÅÄÖ:%#-.]+\3)/g,
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
