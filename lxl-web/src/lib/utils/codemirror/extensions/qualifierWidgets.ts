import type { SearchMapping } from '$lib/utils/search';
import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	WidgetType,
	type ViewUpdate,
	type DecorationSet
} from '@codemirror/view';
import { mount } from 'svelte';
import QualifierWidgetComponent from '$lib/components/QualifierWidget.svelte';

export const QUALIFIER_REGEXP = new RegExp(
	/(?<!\S+)((")?[0-9a-zA-ZaåöAÅÖ:]+\2):((")?[0-9a-zA-ZaåöAÅÖ:%#-.]+\4?)?(\s|$)/g
);

class QualifierWidget extends WidgetType {
	constructor(
		readonly qualifier: {
			type: string;
			value: string;
		},
		readonly searchMappings: SearchMapping[]
	) {
		super();
	}
	eq(other: QualifierWidget) {
		return (
			this.qualifier.type == other.qualifier.type &&
			this.qualifier.value == other.qualifier.value &&
			this.searchMappings == other.searchMappings // should we filter out freetext querys?
		);
	}
	toDOM() {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierWidgetComponent, {
			target: container,
			props: {
				type: this.qualifier.type,
				value: this.qualifier.value,
				searchMappings: this.searchMappings || []
			}
		});
		return container;
	}
	ignoreEvent() {
		return false;
	}
}

const createQualifierMatcher = (searchMappings: SearchMapping[]) =>
	new MatchDecorator({
		regexp: QUALIFIER_REGEXP,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		decoration: ([_1, type, _2, value]) => {
			if (type) {
				return Decoration.replace({
					widget: new QualifierWidget({ type, value }, searchMappings)
				});
			}
			return null;
		}
	});

export const createQualifierWidgets = (searchMappings: SearchMapping[]) => {
	const qualifierMatcher = createQualifierMatcher(searchMappings);
	return ViewPlugin.fromClass(
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
};

// export default qualifierWidgets;

/*
import {
	EditorView,
	MatchDecorator,
	Decoration,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
	type DecorationSet
} from '@codemirror/view';
import { mount } from 'svelte';
import PropertyWidgetComponent from '$lib/components/CodeMirror.PropertyWidget.svelte';

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
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(PropertyWidgetComponent, { target: container, props: this.property });
		return container;
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
*/
