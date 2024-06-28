import type { Action } from 'svelte/action';
import Popover from '$lib/components/Popover.svelte';

/**
 * Svelte action used for showing generic content inside a popover. This action will be much more flexible with Svelte 5 when
 * we will be able to set slots when creating component instances (see: https://github.com/sveltejs/svelte/issues/2588)
 *
 * Tests to do:
 * - [] Attaches popover when user hovers over trigger node (after delay)
 * - [] Removes popover when user stops hovering over trigger node (after delay)
 * - [] Removes popover when user blurs trigger node
 * - [] Keeps popover open if user hovers over popover (when leaving trigger node)
 * - [] Removes popover if user stops hovering over popover (without entering trigger node)
 * - [] Keeps popover if user has focused child element
 * - [] Closes popover immediately when the URL changes
 */

export const popover: Action<HTMLElement, { title: string }> = (node: HTMLElement, { title }) => {
	const ATTACH_DELAY = 500;
	const REMOVE_DELAY = 200;
	const container = document.getElementById('floating-elements-container') || document.body; // See https://atfzl.com/articles/don-t-attach-tooltips-to-document-body

	let attached = false;
	let floatingElement: Popover | null = null;
	let cancelAttach: (reason?: unknown) => void;
	let cancelRemove: (reason?: unknown) => void;

	node.addEventListener('mouseover', attachPopover);
	node.addEventListener('mouseout', removePopover);
	node.addEventListener('focus', attachPopover);
	node.addEventListener('blur', removePopover);

	async function attachPopover() {
		try {
			cancelAttach?.(); // cancel earlier promises to ensure popovers doesn't appear after navigating
			cancelRemove?.();
			if (!attached) {
				await new Promise((resolve, reject) => {
					cancelAttach = reject; // allows promise rejection from outside the promise constructor scope
					setTimeout(resolve, ATTACH_DELAY);
				});

				floatingElement = new Popover({
					target: container,
					props: {
						referenceElement: node,
						data: title, // data should be removed when we can set slots directly using Svelte 5 (see: https://github.com/sveltejs/svelte/issues/2588)
						onMouseOver: startFloatingElementInteraction,
						onFocus: startFloatingElementInteraction,
						onMouseLeave: endFloatingElementInteraction,
						onBlur: endFloatingElementInteraction
					}
				});
				attached = true;
			}
			// eslint-disable-next-line no-empty
		} catch {}
	}

	async function removePopover() {
		try {
			cancelAttach?.();
			await new Promise((resolve, reject) => {
				cancelRemove = reject;
				setTimeout(resolve, REMOVE_DELAY);
			});
			destroyPopover();
			// eslint-disable-next-line no-empty
		} catch {}
	}

	function destroyPopover() {
		cancelAttach?.();
		cancelRemove?.();
		floatingElement?.$destroy();
		attached = false;
	}

	function startFloatingElementInteraction() {
		cancelRemove?.();
	}

	function endFloatingElementInteraction() {
		removePopover();
	}

	return {
		destroy() {
			destroyPopover();
			node.removeEventListener('mouseover', attachPopover);
			node.removeEventListener('mouseout', removePopover);
			node.removeEventListener('focus', attachPopover);
			node.removeEventListener('blur', removePopover);
		}
	};
};

export default popover;
