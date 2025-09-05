<!-- This component should probably merge with HoldingsModal in a more flexible solution to display various content 
inside a modal/panel -->
<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { type CitationsType } from '$lib/types/citation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Modal from './Modal.svelte';
	import Citations from './Citations.svelte';

	let previousURL: URL;

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
		}
	});

	function handleCloseCitations() {
		if (!previousURL?.searchParams.has('cite')) {
			history.back();
		} else {
			const newSearchParams = new SvelteURLSearchParams([
				...Array.from(page.url.searchParams.entries())
			]);
			newSearchParams.delete('cite');
			goto(page.url.pathname + `?${newSearchParams.toString()}`, { replaceState: true });
		}
	}
</script>

{#if page.state.citations || page.url.searchParams.get('cite')}
	<Modal close={handleCloseCitations}>
		{#snippet title()}
			<span>{page.data.t('citations.createCitation')}</span>
		{/snippet}
		<Citations
			citations={(page.state.citations || page.data.citations) as Promise<CitationsType>}
			id={page.state.citationId || page.url.searchParams.get('cite')}
		/>
	</Modal>
{/if}
