import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	WidgetType,
	type ViewUpdate,
	type DecorationSet
} from '@codemirror/view';

export const QUALIFIER_REGEXP = new RegExp(
	/(?<!\S+)((")?[0-9a-zA-ZaåöAÅÖ:]+\2):((")?[0-9a-zA-ZaåöAÅÖ:%#-]+\4?)?(\s|$)/g
);

class QualifierWidget extends WidgetType {
	constructor(
		readonly qualifier: {
			name: string;
			value: string;
		}
	) {
		super();
	}
	eq(other: QualifierWidget) {
		return (
			this.qualifier.name == other.qualifier.name && this.qualifier.value == other.qualifier.value
		);
	}
	toDOM() {
		const elt = document.createElement('span');
		const name = document.createElement('span');
		const value = document.createElement('span');

		name.style.cssText = `
    border-radius: 3px 0 0 3px;
    padding: 2px 3px 2px 3px;
    background: rgba(14, 113, 128, 0.2);
		color: #0E7180;
		font-size: var(--font-size-2xs);
		font-weight:500;`;
		name.textContent = `${this.qualifier.name}:`;
		elt.appendChild(name);

		value.style.cssText = `
		border-left: none;
    border-radius: 0 3px 3px 0;
    padding: 2px 3px 2px 3px;
    background: rgba(14, 113, 128, 0.1);
		font-size: var(--font-size-2xs);`;
		value.textContent = this.qualifier.value || '';
		elt.appendChild(value);

		elt.appendChild(document.createTextNode('\u00A0'));
		return elt;
	}
	ignoreEvent() {
		return false;
	}
}

// check in transaction filter if part of decoration. If it is, skip editing?
const qualifierMatcher = new MatchDecorator({
	regexp: QUALIFIER_REGEXP,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	decoration: ([_1, name, _2, value]) => {
		if (name) {
			return Decoration.replace({
				widget: new QualifierWidget({ name, value })
			});
		}
		return null;
	}
});

const qualifierWidgets = ViewPlugin.fromClass(
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
		decorations: (instance) => instance.qualifiers,
		provide: (plugin) =>
			EditorView.atomicRanges.of((view) => {
				return view.plugin(plugin)?.qualifiers || Decoration.none;
			})
	}
);

export default qualifierWidgets;
