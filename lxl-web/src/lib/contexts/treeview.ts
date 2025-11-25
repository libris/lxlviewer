import { createContext } from 'svelte';
import type { TreeItemSnippet } from '$lib/types/treeview';
import type { TreePath } from '$lib/components/treeview/TreeView.svelte';

type TreeViewContext = {
	treeItem?: TreeItemSnippet;
	selectable?: 'single' | 'multiple';
	tabbablePath?: TreePath;
	animated?: boolean;
	getId?: (path: Path) => string | undefined;
	getSetsize?: (path: Path) => number;
	getPosinset?: (path: Path) => number;
	getExpanded?: (path: Path) => boolean | undefined;
	getSelected?: (path: Path) => boolean | undefined;
	getOwnsId?: (path: Path) => string | undefined;
	getHasSelected?: (path: Path) => boolean | undefined;
};

export const [getTreeViewContext, setTreeViewContext] = createContext<TreeViewContext>();
