<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { afterNavigate } from '$app/navigation';
	import { matomoTracker } from '$lib/stores/matomo-tracker';

	const URL: string = env.PUBLIC_MATOMO_URL;
	const MATOMO_ID: number = +env.PUBLIC_MATOMO_ID;

	async function initMatomo() {
		const matomo = window.Matomo;

		if (matomo && MATOMO_ID) {
			const track = matomo.getTracker(`${URL}/matomo.php`, MATOMO_ID);

			if (track) {
				track.disableCookies(); // TODO - remove when cookie consent implemented
				track.enableLinkTracking();

				// add to store
				matomoTracker.set(track);
				track.trackPageView();
			}
		}
	}

	afterNavigate(async ({ to, from, type }) => {
		if (type === 'enter' || !$matomoTracker) {
			await initMatomo();
		} else {
			if (from?.url.href) {
				$matomoTracker.setReferrerUrl(from.url.href);
			}
			if (to?.url.href) {
				$matomoTracker.setCustomUrl(to.url.href);
			}
			$matomoTracker.trackPageView(document.title);
		}
	});
</script>

<svelte:head>
	{#if URL}
		<script async defer src={`${URL}/matomo.js`}></script>
	{/if}
</svelte:head>
