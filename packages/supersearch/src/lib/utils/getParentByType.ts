import type { SyntaxNode } from '@lezer/common';
/**
 * If a node belongs to a named parent, return the parent.
 */
export function getParentNodeByType(node: SyntaxNode, name: string): SyntaxNode | false {
	if (!node || !name) return false;

	let current: SyntaxNode | null = node;

	while (current && current.name !== name) {
		current = current.parent;
	}

	return current?.name === name ? current : false;
}
