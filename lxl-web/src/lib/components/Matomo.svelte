<script lang="ts">
	import { PUBLIC_MATOMO_URL } from '$app/env/public';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { setMatomoTracker, getMatomoTracker, setMatomoContext } from '#lib/contexts/matomo.js';
	import { onMount, type Snippet } from 'svelte';
	import { browser } from '$app/env';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const URL: string = PUBLIC_MATOMO_URL;
	const matomoId: number | undefined = page.data.matomoId;
	let scriptTag: HTMLScriptElement | undefined = $state();

	setMatomoContext(matomoId);
	const tracker = getMatomoTracker();

	function onMatomoScriptLoad() {
		if (!$tracker) {
			setMatomoTracker(matomoId);
		}
	}

	afterNavigate(async ({ to, from, type, shallow }) => {
		if (shallow && type === 'goto') return;

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
	{#if URL && matomoId}
		<script bind:this={scriptTag} async defer src={`${URL}/matomo.js`}></script>
	{/if}
</svelte:head>
{@render children?.()}
