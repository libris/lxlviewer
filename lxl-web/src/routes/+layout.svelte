<script lang="ts">
	import '../app.css';
	import NProgress from 'nprogress';
	import '../nprogress.css';
	import Matomo from '$lib/components/Matomo.svelte';
	import { navigating } from '$app/stores';

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
	<Matomo />
</div>
