import { createContext } from 'svelte';
import type { ChangeHandler, TreeMenuItemSnippet } from '$lib/types/treemenubar';

type TreeMenuBarContext = {
	menuItem: TreeMenuItemSnippet;
	animated: boolean;
	onchange?: ChangeHandler;
};

export const [getTreeMenuBarContext, setTreeMenuBarContext] = createContext<TreeMenuBarContext>();
