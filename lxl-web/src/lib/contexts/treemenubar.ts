import { createContext } from 'svelte';
import type {
	TreeMenuItemSnippet,
	ToggleHandlerParams,
	TreeMenuItem
} from '$lib/types/treemenubar';

type TreeMenuBarContext = {
	menuItem: TreeMenuItemSnippet;
	animated: boolean;
	toggle: (params: ToggleHandlerParams) => void;
	handleKeyDown: (item: TreeMenuItem, event: KeyboardEvent) => void;
	expandedItems: () => TreeMenuItem[];
	tabbableItem: () => TreeMenuItem;
};

export const [getTreeMenuBarContext, setTreeMenuBarContext] = createContext<TreeMenuBarContext>();
