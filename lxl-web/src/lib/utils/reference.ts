import { pushState } from '$app/navigation';
import { SvelteURLSearchParams } from 'svelte/reactivity';

export function getReferenceLink(url: URL, value: string) {
	const newSearchParams = new SvelteURLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.set('reference', value);
	return `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
}

export function handleClickReference(
	event: MouseEvent & { currentTarget: HTMLAnchorElement },
	state: object,
	id: string
) {
	event.preventDefault();
	pushState(event.currentTarget.href, { ...state, reference: id });
}
