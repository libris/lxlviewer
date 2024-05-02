import { setContext, getContext } from 'svelte';

export function setModalContext() {
	setContext('modal', true);
}

export function getModalContext() {
	return getContext('modal');
}
