import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { type Writable } from 'svelte/store';
import { type MatomoTracker } from '$lib/types/matomo';
import { setContext, getContext } from 'svelte';

const MATOMO_ID: number = +env.PUBLIC_MATOMO_ID;

function initMatomo() {
	if (browser) {
		const matomo = window.Matomo;
		if (matomo && MATOMO_ID) {
			const tracker = matomo.getTracker(`${env.PUBLIC_MATOMO_URL}/matomo.php`, MATOMO_ID);

			if (tracker) {
				tracker.requireConsent();
				tracker.enableLinkTracking();
				return tracker;
			}
		}
	}
}

export function setMatomoTracker() {
	const initializedMatomoTracker = initMatomo();
	if (initializedMatomoTracker) {
		const tracker = writable<MatomoTracker>(initializedMatomoTracker);
		setContext('matomo', tracker);
	}
}

export function getMatomoTracker() {
	return getContext<Writable<MatomoTracker>>('matomo');
}
