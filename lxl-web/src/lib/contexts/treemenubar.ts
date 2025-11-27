import { createContext } from 'svelte';
import type { TreeMenuItemSnippet } from '$lib/types/treemenubar';

type TreeMenuBarContext = {
	menuItem: TreeMenuItemSnippet;
	animated?: boolean;
};

export const [getTreeMenuBarContext, setTreeMenuBarContext] = createContext<TreeMenuBarContext>();
