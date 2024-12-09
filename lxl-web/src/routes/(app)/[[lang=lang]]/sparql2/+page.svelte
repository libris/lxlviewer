<script lang="ts">
	import { onMount } from 'svelte';
	import '@triply/yasgui/build/yasgui.min.css';

	onMount(async () => {
		// only in browser
		// yasgui module expects 'window' to exist
		const module = await import('@triply/yasgui');
		const Yasgui = module.default;

		new Yasgui(document.getElementById('yasgui'), {
			requestConfig: { endpoint: 'https://libris-qa.kb.se/sparql' },
			copyEndpointOnNewTab: true
		});
	});
</script>

<div id="yasgui"></div>
