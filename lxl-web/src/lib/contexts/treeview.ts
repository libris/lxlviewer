import { createContext } from 'svelte';
import type { TreeItemSnippet } from '$lib/types/treeview';

type TreeViewContext = {
	treeItem: TreeItemSnippet;
	animated?: boolean;
};

export const [getTreeViewContext, setTreeViewContext] = createContext<TreeViewContext>();
