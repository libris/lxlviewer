import { Facet } from '@codemirror/state';
import type { QualifierValidator, QualifierRenderer } from '$lib/types/lxlQualifierPlugin.js';

export const qualifierValidatorFacet = Facet.define<QualifierValidator, QualifierValidator>({
	combine(values) {
		return values[0];
	}
});

export const qualifierRenderFacet = Facet.define<QualifierRenderer, QualifierRenderer>({
	combine(values) {
		return values[0];
	}
});
