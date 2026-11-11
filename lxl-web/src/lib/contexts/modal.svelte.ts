import type { ModalType } from '#lib/types/modal.js';
import { relativizeUrl } from '#lib/utils/http.js';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { setContext, getContext } from 'svelte';
import { SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';

export type ModalContext = {
	readonly isOpen: ModalType | undefined;
	onClose: (type: ModalType) => void;
	onOpen: (opts: OpenModalOptions) => void;
};

interface OpenModalOptions {
	type: ModalType;
	hash?: string;
	searchParams?: Record<string, string | null>;
	state?: Record<string, unknown>;
}

function createModal(): ModalContext {
	let isOpen: ModalType | undefined = $state();

	return {
		get isOpen() {
			return isOpen;
		},

		onClose(type) {
			if (page.state?.modal?.type === type) {
				console.log('history back');
				history.back();
			} else {
				const newSearchParams = new SvelteURLSearchParams([
					...Array.from(page.url.searchParams.entries())
				]);
				newSearchParams.delete(type);
				goto(resolve(page.url.pathname + `?${newSearchParams.toString()}`), { replace: true });
			}
			isOpen = undefined;
		},

		async onOpen({ type, hash, searchParams, state = {} }) {
			const url = new SvelteURL(page.url.toString());

			if (hash !== undefined) {
				url.hash = hash;
			}

			if (searchParams) {
				for (const [key, value] of Object.entries(searchParams)) {
					if (value === null) {
						url.searchParams.delete(key);
					} else {
						url.searchParams.set(key, value);
					}
				}
			}

			const rel = relativizeUrl(url.toString()) as string;

			await goto(resolve(rel), {
				shallow: true,
				state: {
					...page.state,
					...state,
					...{ modal: { type } }
				}
			});
			isOpen = type;
		}
	};
}

const paneKey = Symbol('modal');

export function setModalContext() {
	const modal = createModal();
	setContext(paneKey, modal);
}

export function getModalContext() {
	return getContext<ModalContext>(paneKey);
}
