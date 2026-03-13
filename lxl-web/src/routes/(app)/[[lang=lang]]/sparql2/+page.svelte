<script lang="ts">
	import { page } from '$app/state';

	const DEFAULT_QUERY = `BASE <${page.data.sparqlBaseUrl}/>
PREFIX ktg: <https://id.kb.se/term/ktg/>
PREFIX marc: <https://id.kb.se/marc/>
PREFIX saogf: <https://id.kb.se/term/saogf/>
PREFIX saobf: <https://id.kb.se/term/saobf/>
PREFIX : <https://id.kb.se/vocab/>

SELECT ?type (count(?s) as ?count) WHERE {
  ?s a ?type.
  FILTER isIRI(?s)
}
ORDER BY DESC(?count)
      `;

	import { onMount } from 'svelte';
	import '@triply/yasgui/build/yasgui.min.css';

	onMount(async () => {
		// only in browser
		// yasgui module expects 'window' to exist
		const module = await import('@triply/yasgui');
		const Yasgui = module.default;

		new Yasgui(document.getElementById('yasgui'), {
			requestConfig: {
				endpoint: `${page.data.sparqlBaseUrl}/sparql`
			},
			copyEndpointOnNewTab: true,
			yasqe: {
				value: DEFAULT_QUERY
			}
		});
	});
</script>

<div id="yasgui" class="mt-3"></div>

<style>
	:global(.yasgui .controlbar) {
		display: none !important;
	}
</style>
