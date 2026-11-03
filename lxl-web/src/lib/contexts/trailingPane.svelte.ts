import { getContext, setContext, tick } from 'svelte';
import { getUserSettings } from './userSettings';
import { getSelectionContext } from './selection.svelte';
import { TRAILING_PANE_DEFAULT_WIDTH } from '#lib/constants/panels.js';

type TrailingPaneContext = {
	readonly expandBtnId: string;
	readonly collapseBtnId: string;
	readonly visible: boolean;
	readonly canExpand: boolean;
	readonly width: number;
	onClose: () => void;
	onOpen: () => void;
	setWidth: (width: number) => void;
};

function createTrailingPane(): TrailingPaneContext {
	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	const isVisible = $derived(!!(selection.length > 0 && userSettings.trailingPane?.open));
	const canExpand = $derived(selection.length > 0 && !userSettings.trailingPane?.open);

	const expandBtnId = 'expand-trailing-pane-btn';
	const collapseBtnId = 'collapse-trailing-pane-btn';

	return {
		get expandBtnId() {
			return expandBtnId;
		},
		get collapseBtnId() {
			return collapseBtnId;
		},
		get visible() {
			return isVisible;
		},
		get canExpand() {
			return canExpand;
		},
		get width() {
			return userSettings.trailingPane?.width || TRAILING_PANE_DEFAULT_WIDTH;
		},
		onClose() {
			userSettings.closeTrailingPane();
			tick().then(() => {
				document.getElementById(expandBtnId)?.focus();
			});
		},
		onOpen() {
			userSettings.openTrailingPane();
			tick().then(() => {
				document.getElementById(collapseBtnId)?.focus();
			});
		},
		setWidth(width) {
			userSettings.setTrailingPaneWidth(width);
		}
	};
}

const paneKey = Symbol('trailingPane');

export function setTrailingPaneContext() {
	const selection = createTrailingPane();
	setContext(paneKey, selection);
	return selection;
}

export function getTrailingPaneContext() {
	return getContext<TrailingPaneContext>(paneKey);
}
