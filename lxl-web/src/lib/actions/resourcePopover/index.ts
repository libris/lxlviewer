import type { Action } from 'svelte/action';
import type { ResourceData } from '$lib/types/ResourceData';
import ResourcePopover from './ResourcePopover.svelte';
import { getResourceId, getResourcePropertyStyle } from '$lib/utils/resourceData';

/** Tests to do
 * - [] Attaches popover when user hovers over trigger node (after delay)
 * - [] Removes popover when user stops hovering over trigger node (after delay)
 * - [] Removes popover when user blurs trigger node
 * - [] Keeps popover open if user hovers over popover (when leaving trigger node)
 * - [] Removes popover if user stops hovering over popover (without entering trigger node)
 * - [] Keeps popover if user has focused child element
 * - [] Doesn't attach popover if fetching of resource data fails
 */

/* Conditionally add popover action so it's only added when needed */
const conditionalResourcePopover = (node: HTMLElement, value: ResourceData) => {
	const style = getResourcePropertyStyle(value);
	if (style && style.includes('link' || style.includes('definition'))) {
		const id = getResourceId(value);
		if (id) {
			return resourcePopover(node, id);
		}
	}
};

const resourcePopover: Action<HTMLElement, string> = (node: HTMLElement, id: string) => {
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

	async function attachPopover() {
		try {
			cancelRemove?.();
			if (id && !attached) {
				const [decoratedData] = await Promise.all([
					getDecoratedData(`/api/${id.split('/').pop()}`),
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
			floatingElement?.$destroy();
			attached = false;
			// eslint-disable-next-line no-empty
		} catch {}
	}

	function startFloatingElementInteraction() {
		cancelRemove?.();
	}

	function endFloatingElementInteraction() {
		removePopover();
	}

	async function getDecoratedData(id: string) {
		await new Promise((resolve, reject) => {
			cancelFetch = reject;
			setTimeout(resolve, FETCH_DELAY);
		});
		try {
			const resourceRes = await fetch(`/api/${id.split('/').pop()}`);
			const resource = await resourceRes.json();
			return resource;
		} catch (error) {
			console.error(error);
			cancelAttach?.();
		}
	}

	return {
		destroy() {
			node.removeEventListener('mouseover', attachPopover);
			node.removeEventListener('mouseout', removePopover);
		}
	};
};

export default conditionalResourcePopover;
