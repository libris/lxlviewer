<script lang="ts">
	import '../app.css';
	import '../themes.css';
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

<div class="flex min-h-screen flex-col">
	<Matomo>
		{@render children()}
		<CookieConsent />
	</Matomo>
</div>

<style>
</style>
