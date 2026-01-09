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

export interface QualifierState extends QualifierValidationResponse {
	atomicFrom?: number;
	atomicTo?: number;
	node: SyntaxNode;
}

export type QualifierStateField = {
	qualifiers: Map<string, QualifierState>;
	atomicRanges: RangeSet<RangeValue>;
};

export type QualifierRenderer = (
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
