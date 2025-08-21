<!-- This component should probably merge with HoldingsModal in a more flexible solution to display various content 
inside a modal/panel -->
<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Modal from './Modal.svelte';
	import Citations from './Citations.svelte';

	let previousURL: URL;
	// TODO type
	const citations: Promise<unknown> = page.data.citations;

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

{#if page.state.cite || page.url.searchParams.has('cite')}
	<Modal close={handleCloseCitations}>
		{#snippet title()}
			<span>{page.data.t('citations.createCitation')}</span>
		{/snippet}
		<Citations {citations} />
	</Modal>
{/if}
