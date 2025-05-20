import type { Action } from 'svelte/action';
import DropDownMenu, { type MenuItem } from './DropDownMenu.svelte';
import { mount, unmount } from 'svelte';

type Parameter = {
	placeAsSibling?: boolean; // place DropDownMenu next to node in the DOM (to force it on top of modal, for example)
	menuItems: MenuItem[];
};

export const dropdownMenu: Action<HTMLElement, Parameter> = (
	node,
	{ placeAsSibling, menuItems }
) => {
	const ATTACH_DELAY = 500;
	const REMOVE_DELAY = 200;

	$effect(() => {
		// setup goes here
		let container = document.getElementById('floating-elements-container') || document.body; // See https://atfzl.com/articles/don-t-attach-tooltips-to-document-body

		if (placeAsSibling && node.parentElement) {
			container = node.parentElement;
		}

		let attached = false;
		let floatingElement: DropDownMenu | null;
		let cancelAttach: ((reason?: unknown) => void) | undefined;
		let cancelRemove: ((reason?: unknown) => void) | undefined;

		node.addEventListener('click', attachDropDownMenu);
		node.addEventListener('mouseover', attachDropDownMenu);
		node.addEventListener('mouseout', removeDropDownMenu);
		node.addEventListener('focus', attachDropDownMenu);
		node.addEventListener('blur', removeDropDownMenu);

		async function attachDropDownMenu(event: MouseEvent | FocusEvent) {
			try {
				cancelAttach?.(); // cancel earlier promises to ensure DropDownMenus doesn't appear after navigating
				cancelRemove?.();
				if (!attached) {
					await new Promise((resolve, reject) => {
						cancelAttach = reject; // allows promise rejection from outside the promise constructor scope
						if (event.type === 'click') {
							resolve(undefined);
						} else {
							setTimeout(resolve, ATTACH_DELAY);
						}
					});

					floatingElement = mount(DropDownMenu, {
						target: container,
						props: {
							referenceElement: node,
							onmouseover: startFloatingElementInteraction,
							onfocus: startFloatingElementInteraction,
							onmouseleave: endFloatingElementInteraction,
							onblur: endFloatingElementInteraction,
							menuItems
						}
					});

					attached = true;
				}
				// eslint-disable-next-line no-empty
			} catch {}
		}

		async function removeDropDownMenu() {
			try {
				cancelAttach?.();
				await new Promise((resolve, reject) => {
					cancelRemove = reject;
					setTimeout(resolve, REMOVE_DELAY);
				});
				destroyDropDownMenu();
				// eslint-disable-next-line no-empty
			} catch {}
		}

		function destroyDropDownMenu() {
			cancelAttach?.();
			cancelRemove?.();
			if (attached && floatingElement) {
				unmount(floatingElement);
			}
			attached = false;
		}

		function startFloatingElementInteraction() {
			cancelRemove?.();
		}

		function endFloatingElementInteraction() {
			removeDropDownMenu();
		}

		return () => {
			destroyDropDownMenu();
			node.removeEventListener('click', attachDropDownMenu);
			node.removeEventListener('mouseover', attachDropDownMenu);
			node.removeEventListener('mouseout', removeDropDownMenu);
			node.removeEventListener('focus', attachDropDownMenu);
			node.removeEventListener('blur', removeDropDownMenu);
		};
	});
};

export default dropdownMenu;
