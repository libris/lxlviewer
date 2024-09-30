<script lang="ts">
	import '../app.css';
	import NProgress from 'nprogress';
	import '../nprogress.css';
	import Matomo from '$lib/components/Matomo.svelte';
	import { navigating } from '$app/stores';
	import { matomoTracker } from '$lib/stores/matomo-tracker';

	// remove this
	// try $matomoTracker.trackEvent() on someting
	function optIn() {
		$matomoTracker.rememberConsentGiven(24 * 356);
	}

	function optOut() {
		$matomoTracker.forgetConsentGiven();
	}

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

<div class="flex min-h-screen flex-col">
	<slot />
	<Matomo requireConsent={true} />
	<!-- remove this -->
	<button on:click={optIn}>Opt in</button>
	<button on:click={optOut}>Opt out</button>
</div>
