<script lang="ts">
	import '../app.css';
	import NProgress from 'nprogress';
	import '$lib/styles/nprogress.css';
	import { navigating } from '$app/stores';
	import Matomo from '$lib/components/Matomo.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';

	NProgress.configure({
		//https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16,
		showSpinner: false
	});

	let progressBarTimeout: number | undefined = undefined;
	const progressDelay = 200;

	$: {
		if ($navigating) {
			clearTimeout(progressBarTimeout);
			progressBarTimeout = setTimeout(NProgress.start, progressDelay);
		}
		if (!$navigating) {
			clearTimeout(progressBarTimeout);
			NProgress.done();
		}
	}
</script>

<div class="body-layout grid min-h-screen">
	<Matomo>
		<slot />
		<CookieConsent />
	</Matomo>
</div>

<style lang="postcss">
	.body-layout {
		grid-template-rows: min-content 1fr min-content;
	}
</style>
