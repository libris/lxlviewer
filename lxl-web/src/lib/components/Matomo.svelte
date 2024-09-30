<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { matomoTracker } from '$lib/stores/matomo-tracker';

	export const requireConsent = true;

	const URL = env.PUBLIC_MATOMO_URL;
	const MATOMO_ID = env.PUBLIC_MATOMO_ID;

	onMount(() => {
		initMatomo();
	});

	function initMatomo() {
		const matomo = window.Matomo;

		if (matomo && MATOMO_ID) {
			// add to store
			matomoTracker.set(matomo.getTracker(`${URL}/matomo.php`, MATOMO_ID));

			if ($matomoTracker) {
				if (requireConsent) {
					$matomoTracker.requireConsent();
				}
				$matomoTracker.enableLinkTracking();
				$matomoTracker.trackPageView($page.url.href);
			}
		}
	}

	afterNavigate(async ({ to }) => {
		if (to?.url.href && $matomoTracker) {
			$matomoTracker.trackPageView(to.url.href);
		}
	});
</script>

<svelte:head>
	{#if URL}
		<script async defer src={`${URL}/matomo.js`}></script>
	{/if}
</svelte:head>
