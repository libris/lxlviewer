import { Facet } from '@codemirror/state';
import type { QualifierValidator, QualifierWidgetRenderer } from '$lib/types/lxlQualifierPlugin.js';

export const qualifierValidatorFacet = Facet.define<QualifierValidator, QualifierValidator>({
	combine(values) {
		return values[0];
	}
});

export const qualifierWidgetRendererFacet = Facet.define<
	QualifierWidgetRenderer,
	QualifierWidgetRenderer
>({
	combine(values) {
		return values[0];
	}
});
