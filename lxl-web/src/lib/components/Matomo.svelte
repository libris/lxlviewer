<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { afterNavigate } from '$app/navigation';
	import { setMatomoTracker, getMatomoTracker, setMatomoContext } from '$lib/contexts/matomo';

	const URL: string = env.PUBLIC_MATOMO_URL;

	setMatomoContext();
	const tracker = getMatomoTracker();

	function onMatomoScriptLoad() {
		if (!$tracker) {
			setMatomoTracker();
		}
	}

	afterNavigate(async ({ to, from, type }) => {
		if ($tracker) {
			if (from?.url.href) {
				$tracker.setReferrerUrl(from.url.href);
			}
			if (to?.url.href) {
				$tracker.setCustomUrl(to.url.href);
			}
			if (type !== 'enter') {
				// First track is done on init (when script is ready)
				$tracker.trackPageView(document.title);
			}
		}
	});
</script>

<svelte:head>
	{#if URL}
		<script async defer src={`${URL}/matomo.js`} on:load={onMatomoScriptLoad}></script>
	{/if}
</svelte:head>
<slot />
