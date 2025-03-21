<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import NProgress from 'nprogress';
	import '$lib/styles/nprogress.css';
	import Matomo from '$lib/components/Matomo.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import { userSettings } from '$lib/utils/userSettings.svelte';

	const { children } = $props();
	userSettings.update('name', page.data?.userSettings?.name);

	NProgress.configure({
		//https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16,
		showSpinner: false
	});

	let progressBarTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
	const progressDelay = 300;

	beforeNavigate(() => {
		clearTimeout(progressBarTimeout);
		progressBarTimeout = setTimeout(NProgress.start, progressDelay);
	});

	afterNavigate(() => {
		clearTimeout(progressBarTimeout);
		NProgress.done();
	});
</script>

<div class="body-layout grid min-h-screen">
	<Matomo>
		{@render children()}
		<CookieConsent />
	</Matomo>
</div>

<style lang="postcss">
	.body-layout {
		grid-template-rows: min-content 1fr min-content;
	}
</style>
