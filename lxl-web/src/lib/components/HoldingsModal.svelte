<!-- only used in resource page atm, get rid of this component? -->
<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import type { HoldingsData } from '$lib/types/holdings';
	import Modal from '$lib/components/Modal.svelte';
	import HoldingsContent from './HoldingsContent.svelte';

	const holdings: HoldingsData = $props();
	let previousURL: URL;

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
		}
	});

	function handleCloseHoldings() {
		if (!previousURL?.searchParams.has('holdings')) {
			history.back();
		} else {
			const newSearchParams = new SvelteURLSearchParams([
				...Array.from(page.url.searchParams.entries())
			]);
			newSearchParams.delete('holdings');
			goto(page.url.pathname + `?${newSearchParams.toString()}`, { replaceState: true });
		}
	}
</script>

{#if page.state.holdings || page.url.searchParams.get('holdings')}
	<Modal close={handleCloseHoldings}>
		{#snippet title()}
			<span>{page.data.t('holdings.findAtYourNearestLibrary')}</span>
		{/snippet}
		<HoldingsContent {holdings} />
	</Modal>
{/if}
