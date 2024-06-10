import type { Action } from 'svelte/action';
import type { LocaleCode } from '$lib/i18n/locales';
import ResourcePopover from './ResourcePopover.svelte';
import type { ResourceData } from '$lib/types/resourceData';

/** Tests to do
 * - [] Attaches popover when user hovers over trigger node (after delay)
 * - [] Removes popover when user stops hovering over trigger node (after delay)
 * - [] Removes popover when user blurs trigger node
 * - [] Keeps popover open if user hovers over popover (when leaving trigger node)
 * - [] Removes popover if user stops hovering over popover (without entering trigger node)
 * - [] Keeps popover if user has focused child element
 * - [] Doesn't attach popover if fetching of resource data fails
 * - [] Closes popover immediately when the URL changes
 */

export const resourcePopover: Action<
	HTMLElement,
	{ id?: string; data?: ResourceData[]; lang: LocaleCode }
> = (node: HTMLElement, options) => {
	const FETCH_DELAY = 250;
	const ATTACH_DELAY = 500;
	const REMOVE_DELAY = 200;
	const container = document.getElementById('floating-elements-container') || document.body; // See https://atfzl.com/articles/don-t-attach-tooltips-to-document-body

	let attached = false;
	let floatingElement: ResourcePopover | null = null;
	let cancelAttach: (reason?: unknown) => void;
	let cancelRemove: (reason?: unknown) => void;
	let cancelFetch: (reason?: unknown) => void;

	node.addEventListener('mouseover', attachPopover);
	node.addEventListener('mouseout', removePopover);
	node.addEventListener('focus', attachPopover);
	node.addEventListener('blur', removePopover);

	async function attachPopover() {
		try {
			cancelAttach?.(); // cancel earlier promises to ensure popovers doesn't appear after navigating
			cancelRemove?.();
			cancelFetch?.();
			if ((options.id || options.data) && !attached) {
				const [decoratedData] = await Promise.all([
					getDecoratedData(),
					new Promise((resolve, reject) => {
						cancelAttach = reject; // allows promise rejection from outside the promise constructor scope
						setTimeout(resolve, ATTACH_DELAY);
					})
				]);
				floatingElement = new ResourcePopover({
					target: container,
					props: {
						referenceElement: node,
						data: decoratedData,
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
			cancelFetch?.();
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
		cancelFetch?.();
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

	async function getDecoratedData() {
		await new Promise((resolve, reject) => {
			cancelFetch = reject;
			setTimeout(resolve, FETCH_DELAY);
		});
		try {
			let resource;
			if (options.data) {
				resource = options.data;
			} else if (options.id) {
				const resourceRes = await fetch(`/api/${options.lang}/${options.id.split('/').pop()}`);
				resource = await resourceRes.json();
			}
			return resource;
		} catch (error) {
			console.error(error);
			cancelAttach?.();
		}
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

export default resourcePopover;
