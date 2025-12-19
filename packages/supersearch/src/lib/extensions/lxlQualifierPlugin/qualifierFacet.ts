import { Facet } from '@codemirror/state';
import type { QualifierSemantic } from './qualifierValidation.js';
import type { QualifierWidgetProps } from './index.js';

export type QualifierValidator = (key: string, value?: string) => QualifierSemantic;

export const qualifierValidatorFacet = Facet.define<QualifierValidator, QualifierValidator>({
	combine(values) {
		// allow exactly one validator
		return values[0];
	}
});

export type QualifierWidgetRenderer = (
	container: HTMLElement,
	props: QualifierWidgetProps
) => { destroy?: () => void } | void;

export const qualifierWidgetRendererFacet = Facet.define<
	QualifierWidgetRenderer,
	QualifierWidgetRenderer
>({
	combine(values) {
		return values[0];
	}
});
