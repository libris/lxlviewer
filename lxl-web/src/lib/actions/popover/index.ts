import type { Action } from 'svelte/action';
import Popover from './Popover.svelte';
import type { LocaleCode } from '$lib/i18n/locales';
import type { ResourceData } from '$lib/types/resourceData';

/**
 * Svelte action used for showing either a generic title or decorated data for a resource (by supplying the resource id or resource data).
 * This action can be made much more flexible with Svelte 5 when we will be able to set slots when creating component instances (see: https://github.com/sveltejs/svelte/issues/2588)
 *
 * Tests to do:
 * - [] Attaches popover when user hovers over trigger node (after delay)
 * - [] Removes popover when user stops hovering over trigger node (after delay)
 * - [] Removes popover when user blurs trigger node
 * - [] Keeps popover open if user hovers over popover (when leaving trigger node)
 * - [] Removes popover if user stops hovering over popover (without entering trigger node)
 * - [] Keeps popover if user has focused child element
 * - [] Doesn't attach popover if fetching of resource data fails
 * - [] Closes popover immediately when the URL changes
 */

export const popover: Action<
	HTMLElement,
	{
		title?: string;
		resource: { id?: string; data?: ResourceData[]; lang: LocaleCode } | undefined;
	}
> = (node: HTMLElement, { title = undefined, resource = undefined }) => {
	const FETCH_DELAY = 250;
	const ATTACH_DELAY = 500;
	const REMOVE_DELAY = 200;
	const container = document.getElementById('floating-elements-container') || document.body; // See https://atfzl.com/articles/don-t-attach-tooltips-to-document-body

	let attached = false;
	let floatingElement: Popover | null = null;
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
			if (!attached) {
				const [resourceData] = await Promise.all([
					getResourceData(),
					new Promise((resolve, reject) => {
						cancelAttach = reject; // allows promise rejection from outside the promise constructor scope
						setTimeout(resolve, ATTACH_DELAY);
					})
				]);

				floatingElement = new Popover({
					target: container,
					props: {
						referenceElement: node,
						title,
						resourceData,
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

	async function getResourceData() {
		await new Promise((resolve, reject) => {
			cancelFetch = reject;
			setTimeout(resolve, FETCH_DELAY);
		});
		try {
			if (resource?.id) {
				const resourceRes = await fetch(`/api/${resource.lang}/${resource.id.split('/').pop()}`);
				return await resourceRes.json();
			}
			if (resource?.data) {
				return resource.data;
			}
			return;
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

export default popover;
