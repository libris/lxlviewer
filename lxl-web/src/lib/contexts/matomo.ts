import { PUBLIC_MATOMO_URL } from '$app/env/public';
import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { type Writable } from 'svelte/store';
import { type MatomoTracker } from '#lib/types/matomo.js';
import { setContext, getContext } from 'svelte';

const tracker = writable<MatomoTracker>();

function initMatomo(matomoId: number | undefined) {
	if (browser && matomoId) {
		const matomo = window.Matomo;
		if (matomo) {
			const tracker = matomo.getTracker(`${PUBLIC_MATOMO_URL}/matomo.php`, matomoId);

			if (tracker) {
				tracker.requireConsent();
				tracker.enableLinkTracking();
				tracker.trackPageView();
				return tracker;
			}
		}
	}
}

export function setMatomoTracker(matomoId: number | undefined) {
	const initializedMatomoTracker = initMatomo(matomoId);
	if (initializedMatomoTracker) {
		tracker.set(initializedMatomoTracker);
	}
}

export function setMatomoContext(matomoId: number | undefined) {
	setMatomoTracker(matomoId);
	setContext('matomo', tracker);
}

export function getMatomoTracker() {
	return getContext<Writable<MatomoTracker>>('matomo');
}
