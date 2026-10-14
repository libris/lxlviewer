import { PUBLIC_MATOMO_ID, PUBLIC_MATOMO_URL } from '$app/env/public';
import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { type Writable } from 'svelte/store';
import { type MatomoTracker } from '#lib/types/matomo.js';
import { setContext, getContext } from 'svelte';

const MATOMO_ID = PUBLIC_MATOMO_ID && +PUBLIC_MATOMO_ID;

const tracker = writable<MatomoTracker>();

function initMatomo() {
	if (browser) {
		const matomo = window.Matomo;
		if (matomo && MATOMO_ID) {
			const tracker = matomo.getTracker(`${PUBLIC_MATOMO_URL}/matomo.php`, MATOMO_ID);

			if (tracker) {
				tracker.requireConsent();
				tracker.enableLinkTracking();
				tracker.trackPageView();
				return tracker;
			}
		}
	}
}

export function setMatomoTracker() {
	const initializedMatomoTracker = initMatomo();
	if (initializedMatomoTracker) {
		tracker.set(initializedMatomoTracker);
	}
}

export function setMatomoContext() {
	setMatomoTracker();
	setContext('matomo', tracker);
}

export function getMatomoTracker() {
	return getContext<Writable<MatomoTracker>>('matomo');
}
