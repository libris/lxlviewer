<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { afterNavigate } from '$app/navigation';
	import { setMatomoTracker, getMatomoTracker, setMatomoContext } from '$lib/contexts/matomo';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const URL: string = env.PUBLIC_MATOMO_URL;
	let scriptTag: HTMLScriptElement | undefined = $state();

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

	onMount(() => {
		if (browser) {
			scriptTag?.addEventListener('load', onMatomoScriptLoad);
		}
		return () => {
			scriptTag?.removeEventListener('load', onMatomoScriptLoad);
		};
	});
</script>

<svelte:head>
	{#if URL}
		<script bind:this={scriptTag} async defer src={`${URL}/matomo.js`}></script>
	{/if}
</svelte:head>
{@render children?.()}
