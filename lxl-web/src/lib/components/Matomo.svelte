<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { afterNavigate } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { type MatomoTracker } from '$lib/types/matomo';
	import { setMatomoTracker } from '$lib/contexts/matomo';

	const URL: string = env.PUBLIC_MATOMO_URL;
	const MATOMO_ID: number = +env.PUBLIC_MATOMO_ID;

	const tracker = writable<MatomoTracker>();
	setMatomoTracker(tracker);

	async function initMatomo() {
		const matomo = window.Matomo;

		if (matomo && MATOMO_ID) {
			const track = matomo.getTracker(`${URL}/matomo.php`, MATOMO_ID);

			if (track) {
				track.disableCookies(); // TODO - remove when cookie consent implemented
				track.enableLinkTracking();

				// add to matomo context store
				tracker.set(track);
				track.trackPageView();
			}
		}
	}

	afterNavigate(async ({ to, from, type }) => {
		if (type === 'enter' || !$tracker) {
			await initMatomo();
		} else {
			if (from?.url.href) {
				$tracker.setReferrerUrl(from.url.href);
			}
			if (to?.url.href) {
				$tracker.setCustomUrl(to.url.href);
			}
			$tracker.trackPageView(document.title);
		}
	});
</script>

<svelte:head>
	{#if URL}
		<script async defer src={`${URL}/matomo.js`}></script>
	{/if}
</svelte:head>
<slot />
