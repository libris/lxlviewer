<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getHiddenSearchParams from '$lib/utils/getHiddenSearchParams';
	import * as m from '$lib/paraglide/messages.js';

	/** Tests to do
	 * - [] input value is updated after navigating between different find routes (e.g. using back)
	 */

	let q = $page.url.searchParams.get('_q')?.trim();

	const hiddenSearchParams = getHiddenSearchParams($page.url.searchParams);

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			q = to.url.searchParams.get('_q')?.trim();
		}
	});

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = q.trim();
		}
	}
</script>

<form class="search" action="find" on:submit={handleSubmit}>
	<input
		type="search"
		name="_q"
		bind:value={q}
		placeholder={m.searchPlaceholder()}
		aria-label={m.search()}
		spellcheck="false"
	/>
	{#each hiddenSearchParams as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
</form>

<style>
	input {
		box-shadow: var(--box-shadow-border-all);
		border: none;
		border-radius: 8px;
		background: #fff;
		width: 100%;
		min-height: var(--height-input-lg);
		overflow: hidden;
	}
</style>
