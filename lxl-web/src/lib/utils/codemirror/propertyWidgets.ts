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
		elt.style.cssText = `
    border: 1px solid blue;
    border-radius: 4px;
    padding: 0 2px;
    background: lightblue;`;
		elt.textContent = `${this.property.name}:${this.property.value || ''}`;
		return elt;
	}
	ignoreEvent() {
		return false;
	}
}

const propertyMatcher = new MatchDecorator({
	regexp: /([a-zA-ZäöåÄÖÅ]+):([0-9a-zA-ZäöåÄÖÅ]+)?/g,
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
