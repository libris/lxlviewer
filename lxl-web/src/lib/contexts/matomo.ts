import { type Writable } from 'svelte/store';
import { type MatomoTracker } from '$lib/types/matomo';
import { setContext, getContext } from 'svelte';

export function setMatomoTracker(tracker: Writable<MatomoTracker>) {
	setContext('matomo', tracker);
}

export function getMatomoTracker() {
	return getContext<Writable<MatomoTracker>>('matomo');
}
