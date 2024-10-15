<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { afterNavigate } from '$app/navigation';
	import { setMatomoTracker, getMatomoTracker } from '$lib/contexts/matomo';

	const URL: string = env.PUBLIC_MATOMO_URL;

	setMatomoTracker();
	const tracker = getMatomoTracker();

	afterNavigate(async ({ to, from }) => {
		if ($tracker) {
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
