import { createContext } from 'svelte';
import type {
	TreeItemSnippet,
	GetGroupItemsFn,
	GetKeyFn,
	GetSelectedFn
} from '$lib/types/treeview';

type TreeViewContext = {
	treeItemSnippet: TreeItemSnippet;
	getKey: GetKeyFn;
	getSelected?: GetSelectedFn;
	getGroupItems: GetGroupItemsFn;
};

export const [getTreeViewContext, setTreeViewContext] = createContext<TreeViewContext>();
