import type { Action } from 'svelte/action';
import type { LocaleCode } from '$lib/i18n/locales';
import ResourcePopover from './ResourcePopover.svelte';
import type { ResourceData } from '$lib/types/resourceData';

/**
 * Svelte action used for showing decorated resource data inside a popover by providing the resource id.
 * The action takes care of the fetching of the required resource data.
 *
 * Tests to do:
 * - [] Doesn't attach popover if fetching of resource data fails
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
			if (options.data) {
				return options.data;
			}
			if (options.id) {
				const resourceRes = await fetch(`/api/${options.lang}/${options.id.split('/').pop()}`);
				return await resourceRes.json();
			}
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
