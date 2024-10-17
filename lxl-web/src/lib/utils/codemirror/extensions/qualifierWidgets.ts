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
import type { Qualifier } from '$lib/utils/supersearch/qualifiers';
export const QUALIFIER_REGEXP = new RegExp(
	/(?<!\S+)((")?[0-9a-zA-ZåäöÅÄÖ:]+\2):((")?[0-9a-zA-ZåäöÅÄÖ:%#-.]+\4?)?(\s|$)/g
);

class QualifierWidget extends WidgetType {
	constructor(
		readonly qualifier: Qualifier,
		readonly range: { from: number; to: number }
	) {
		super();
	}
	eq(other: QualifierWidget) {
		return (
			this.qualifier.type == other.qualifier.type &&
			this.qualifier.value == other.qualifier.value &&
			this.range == other.range
		);
	}
	toDOM() {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierWidgetComponent, {
			target: container,
			props: {
				qualifier: this.qualifier,
				range: this.range
			}
		});
		return container;
	}
}

const createQualifierMatcher = (qualifiersByPrefixedValue: { [key: string]: Qualifier }) =>
	new MatchDecorator({
		regexp: QUALIFIER_REGEXP,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		decoration: ([match, type, _2, value], view, pos) => {
			const qualifier = Object.entries(qualifiersByPrefixedValue).find(([prefixedValue]) => {
				if (prefixedValue === value) {
					return true;
				}
			})?.[1];
			if (qualifier) {
				return Decoration.replace({
					widget: new QualifierWidget(qualifier, { from: pos, to: pos + match.length }) // There is probably some smarter way to do the removal of the widgets  – we could for example use the [decorate](https://codemirror.net/docs/ref/#view.MatchDecorator.constructor^config.decorate) instead of decoration as the former has from and to assigned
				});
			}
			return null;
		}
	});

export const createQualifierWidgets = (qualifiersByPrefixedValue: { [key: string]: Qualifier }) => {
	const qualifierMatcher = createQualifierMatcher(qualifiersByPrefixedValue);
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
