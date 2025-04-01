<script lang="ts">
	import '../app.css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { setUserSettings } from '$lib/contexts/userSettings';
	import NProgress from 'nprogress';
	import '$lib/styles/nprogress.css';
	import Matomo from '$lib/components/Matomo.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';

	const { children } = $props();

	NProgress.configure({
		//https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16,
		showSpinner: false
	});

	setUserSettings(page.data.userSettings);

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
