import { createContext } from 'svelte';
import type { TreeMenuItemSnippet, ToggleHandlerParams } from '$lib/types/treemenubar';

type TreeMenuBarContext = {
	menuItem: TreeMenuItemSnippet;
	animated: boolean;
	toggle: (params: ToggleHandlerParams) => void;
};

export const [getTreeMenuBarContext, setTreeMenuBarContext] = createContext<TreeMenuBarContext>();
