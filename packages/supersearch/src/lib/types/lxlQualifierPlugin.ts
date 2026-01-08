import type { RangeSet, RangeValue } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';

export type QualifierValidator = (key: string, value?: string) => QualifierValidationResponse;

export interface QualifierValidationResponse {
	key: string;
	value?: string;
	keyLabel?: string;
	valueLabel?: string;
	removeLink?: string;
	invalid: boolean;
}

export interface QualifierSemantic extends QualifierValidationResponse {
	// from: number
	// to: number
	atomicFrom?: number;
	atomicTo?: number;
	node: SyntaxNode;
}

export type QualifierSemanticState = {
	qualifiers: Map<string, QualifierSemantic>;
	atomicRanges: RangeSet<RangeValue>;
};

export type QualifierWidgetRenderer = (
	container: HTMLElement,
	props: QualifierWidgetProps
) => { destroy?: () => void } | void;

export type QualifierWidgetProps = {
	key: string;
	keyLabel?: string;
	operator: string;
	value?: string;
	valueLabel?: string;
	removeLink?: string;
};
