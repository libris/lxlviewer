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
import type { QualifierTypeResponse } from '../../../../routes/api/[[lang=lang]]/qualifier-type/+server';
import type { JsonLd } from '$lib/utils/xl';

export const QUALIFIER_REGEXP = new RegExp(
	/(?<!\S+)((")?[0-9a-zA-ZåäöÅÄÖ:]+\2):((")?[0-9a-zA-ZåäöÅÄÖ:%#-.]+\4?)?(\s|$)/g
);

class QualifierWidget extends WidgetType {
	constructor(
		// readonly qualifier: Qualifier,
		readonly type: string,
		readonly value: string,
		readonly resource: { [JsonLd.ID]: string; [JsonLd.TYPE]: string },
		readonly range: { from: number; to: number }
	) {
		super();
	}
	eq(other: QualifierWidget) {
		return (
			this.type == other.type &&
			this.value == other.value &&
			this.resource == other.resource &&
			this.range == other.range
		);
	}
	toDOM() {
		const container = document.createElement('span');
		container.style.cssText = `position: relative;`;
		mount(QualifierWidgetComponent, {
			target: container,
			props: {
				type: this.type,
				value: this.value,
				resource: this.resource,
				range: this.range
			}
		});
		return container;
	}
}

const createQualifierMatcher = ({
	validQualifierTypes,
	mappingsByPrefixedValue
}: {
	validQualifierTypes: QualifierTypeResponse;
	mappingsByPrefixedValue: { [key: string]: Qualifier };
}) =>
	new MatchDecorator({
		regexp: QUALIFIER_REGEXP,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		decoration: ([match, type, _2, value], view, pos) => {
			const qualifierType = validQualifierTypes.find(
				(item) => item.type.toLowerCase() === type.toLowerCase()
			); // temporarily use toLowerCase to allow ÅR, år, År etc.
			const valueMapping = Object.entries(mappingsByPrefixedValue).find(([prefixedValue]) => {
				if (prefixedValue === value) {
					return true;
				}
			})?.[1];

			if (qualifierType) {
				return Decoration.replace({
					widget: new QualifierWidget(
						qualifierType.label,
						valueMapping?.label || value,
						valueMapping?.resource,
						{ from: pos, to: pos + match.length }
					) // There is probably some smarter way to do the removal of the widgets  – we could for example use the [decorate](https://codemirror.net/docs/ref/#view.MatchDecorator.constructor^config.decorate) instead of decoration as the former has from and to assigned
				});
			}
			return null;
		}
	});

export const createQualifierWidgets = ({
	validQualifierTypes,
	mappingsByPrefixedValue
}: {
	validQualifierTypes: QualifierTypeResponse;
	mappingsByPrefixedValue: { [key: string]: Qualifier };
}) => {
	const qualifierMatcher = createQualifierMatcher({
		validQualifierTypes,
		mappingsByPrefixedValue
	});
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
