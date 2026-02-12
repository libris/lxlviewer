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

export type QualifierId = string;

export interface QualifierState extends QualifierValidationResponse {
	atomicFrom?: number;
	atomicTo?: number;
	node: SyntaxNode;
	editing?: boolean;
}

export type QualifierStateField = {
	qualifiers: Map<string, QualifierState>;
	atomicRanges: RangeSet<RangeValue>;
	editing: {
		from: number;
		to: number;
	} | null;
	version: number;
};

export type QualifierRendererProps = {
	key: string;
	atomicFrom?: number;
	atomicTo?: number;
	keyLabel?: string;
	operator: string;
	value?: string;
	valueLabel?: string;
	removeLink?: string;
};

export type QualifierRenderer = (
	container: HTMLElement,
	props: QualifierRendererProps
) => { destroy?: () => void } | void;
