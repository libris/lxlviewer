import { createContext } from 'svelte';
import type {
	TreeMenuItemSnippet,
	ChangeHandler,
	ToggleHandlerParams
} from '$lib/types/treemenubar';

type TreeMenuBarContext = {
	menuItem: TreeMenuItemSnippet;
	animated: boolean;
	toggle: (params: ToggleHandlerParams) => void;
	onchange?: ChangeHandler;
};

export const [getTreeMenuBarContext, setTreeMenuBarContext] = createContext<TreeMenuBarContext>();
