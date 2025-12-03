import type { TreeMenuItem, TreePath } from '$lib/types/treemenubar';

export function getDataByPath(data: TreeMenuItem[], path: TreePath): TreeMenuItem | undefined {
	return data.find((item) => {
		if (areEqualPaths(item.path, path)) return true;

		if (item.children) {
			return getDataByPath(item.children, path);
		}
	});
}

export function getNestedDataByPath(data: TreeMenuItem[], path: TreePath) {
	return data.filter(({ path: otherPath }) =>
		path.every((part, index) => part === otherPath[index])
	);
}

export function getChildrenByPath(data: TreeMenuItem[], path: TreePath) {
	return data.filter(
		({ path: otherPath }) =>
			otherPath.length === path.length + 1 && path.every((part, index) => part === otherPath[index])
	);
}

export function areEqualPaths(a: TreePath, b: TreePath) {
	return a.length === b.length && a.every((part, index) => part === b[index]);
}

export function getVisibleItems(
	data: TreeMenuItem[],
	expandedItems: TreeMenuItem[]
): TreeMenuItem[] {
	return data.filter(({ path }) => {
		if (path.length === 1) {
			return true;
		}
		/** Nested items are visible if all parent paths are expanded  */
		for (let i = 1; i < path.length; i++) {
			const partPath = [...path.slice(0, i)];
			if (!expandedItems.find(({ path: expandedPath }) => areEqualPaths(expandedPath, partPath))) {
				return false;
			}
		}
		return true;
	});
}
