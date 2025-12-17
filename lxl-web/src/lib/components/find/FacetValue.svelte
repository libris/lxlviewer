<script lang="ts">
	import { page } from '$app/state';

	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	import type { FacetValue } from '$lib/types/search';

	interface Props {
		data: FacetValue;
	}

	let { data }: Props = $props();
</script>

<a
	role="menuitem"
	class={[
		`flex no-underline justify-between`,
	]}
	href={page.data.localizeHref(data.view['@id'])}
	data-sveltekit-preload-data="false"
>
	<span class="truncate" title={data.str}>
		{#if 'selected' in data}
			<!-- checkboxes -->
			<span class="sr-only">{data.selected ? page.data.t('search.activeFilter') : ''}</span>
			<div class="bg-page mr-1 inline-block rounded-sm text-xs" aria-hidden="true">
				{#if data.selected}
					<BiCheckSquareFill class="text-accent" />
				{:else}
					<BiSquare class="text-subtle" />
				{/if}
			</div>
		{/if}
		<span class="truncate">
			<DecoratedDataLite data={data.label} />
			{#if data.discriminator}
				<span class="text-subtle">({data.discriminator})</span>
			{/if}
		</span>
	</span>
	{#if data.totalItems > 0}
		<span class="badge shrink-0" aria-label="{data.totalItems} {page.data.t('search.hits')}">
			{data.totalItems.toLocaleString(page.data.locale)}
		</span>
	{/if}
</a>
