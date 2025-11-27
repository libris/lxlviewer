import type { TreeMenuItem, TreePath } from '$lib/types/treemenubar';

export function getDataByPath(data: TreeMenuItem[], path: TreePath) {
	return data.filter(({ path: otherPath }) =>
		path.every((part, index) => part === otherPath[index])
	);
}

export function getChildrenByPath(data: TreeMenuItem[], path: TreePath) {
	return data.filter(
		({ path: otherPath }) =>
			otherPath.length !== path.length && path.every((part, index) => part === otherPath[index])
	);
}
