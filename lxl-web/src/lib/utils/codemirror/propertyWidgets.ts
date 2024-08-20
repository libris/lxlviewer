import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';

class PropertyWidget extends WidgetType {
	constructor(
		readonly property: {
			name: string;
			value: string;
		}
	) {
		super();
	}
	eq(other: PropertyWidget) {
		return this.property.name == other.property.name && this.property.value == other.property.value;
	}
	toDOM() {
		const elt = document.createElement('span');
		const name = document.createElement('span');
		const value = document.createElement('span');

		name.style.cssText = `
    border: 1px solid #ccc;
		border-right: none;
    border-radius: 4px 0 0 4px;
    padding: 0 2px;
    background: lightblue;`;
		name.textContent = this.property.name;
		elt.appendChild(name);

		value.style.cssText = `
    border: 1px solid #ccc;
		border-left: none;
    border-radius: 0 4px 4px 0;
    padding: 0 2px;
    background: lightgreen;`;
		value.textContent = this.property.value || '';
		elt.appendChild(value);

		elt.appendChild(document.createTextNode('\u00A0'));
		return elt;
	}
	ignoreEvent() {
		return false;
	}
}

// check in transaction filter if part of decoration. If it is, skip editing?
const propertyMatcher = new MatchDecorator({
	regexp: /([a-zA-ZäöåÄÖÅ]+):([0-9a-zA-ZäöåÄÖÅ]+)?[\s]/g,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	decoration: ([_, name, value]) => {
		return Decoration.replace({
			widget: new PropertyWidget({ name, value })
		});
	}
});

const propertyWidgets = ViewPlugin.fromClass(
	class {
		properties: DecorationSet;
		constructor(view: EditorView) {
			this.properties = propertyMatcher.createDeco(view);
		}
		update(update: ViewUpdate) {
			this.properties = propertyMatcher.updateDeco(update, this.properties);
		}
	},
	{
		decorations: (instance) => instance.properties,
		provide: (plugin) =>
			EditorView.atomicRanges.of((view) => {
				return view.plugin(plugin)?.properties || Decoration.none;
			})
	}
);

export default propertyWidgets;
