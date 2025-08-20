<!-- This component should probably merge with HoldingsModal in a more flexible solution to display various content 
inside a modal/panel -->
<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Modal from './Modal.svelte';

	let previousURL: URL;

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
		}
	});

	function handleCloseReferenceModal() {
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

{#if page.state.reference || page.url.searchParams.has('reference')}
	<Modal close={handleCloseReferenceModal}>
		{#snippet title()}
			<span>{page.data.t('reference.createReference')}</span>
		{/snippet}
		<p>Hello</p>
	</Modal>
{/if}
