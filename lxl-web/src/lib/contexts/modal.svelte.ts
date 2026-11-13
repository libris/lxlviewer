import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page, type Page } from '$app/state';
import { setContext, getContext } from 'svelte';
import { SvelteURL } from 'svelte/reactivity';
import type { ModalType } from '#lib/types/modal.js';
import { relativizeUrl } from '#lib/utils/http.js';
import { dev } from '$app/env';

type OnOpenProps = {
	hash?: string;
	searchParams?: Record<string, string>;
	state?: Record<string, string> | object;
};

export type ModalContext = {
	onOpen: (props: OnOpenProps) => void;
	onClose: (type: ModalType) => void;
};

function createModal(): ModalContext {
	let previousUrl: Page['url'] | undefined = undefined;
	return {
		onOpen({ hash, searchParams, state }: OnOpenProps) {
			previousUrl = page.url;
			const url = new SvelteURL(page.url.toString());

			if (hash) {
				url.hash = hash;
			}

			if (searchParams) {
				for (const [key, value] of Object.entries(searchParams)) {
					url.searchParams.set(key, value);
				}
			}
			console.log('goto', resolve(relativizeUrl(url.toString()) as string));
			goto(resolve(relativizeUrl(url.toString()) as string), {
				shallow: true,
				state: {
					...page.state,
					...state
				}
			});
		},
		onClose(type: ModalType) {
			if (previousUrl && previousUrl.pathname === page.url.pathname) {
				history.back();
			} else {
				// construct url without param
				const url = new SvelteURL(page.url.toString());
				url.searchParams.delete(type);
				if (url.hash === `#${type}`) {
					url.hash = '';
				}
				goto(url, { replace: true, reset: false });
			}
		}
	};
}

const modalKey = Symbol.for('modal');

export function setModalContext() {
	const modal = createModal();
	setContext(modalKey, modal);
	return modal;
}

export function getModalContext() {
	const context = getContext<ModalContext>(modalKey);

	if (dev && !context) {
		console.trace('Modal context missing');
	}

	return context;
}
