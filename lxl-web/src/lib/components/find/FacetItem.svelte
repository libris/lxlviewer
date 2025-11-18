<script lang="ts">
	import { page } from '$app/state';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	let { data, level }: { data: unknown; level: number } = $props();
	const href = $derived(data.view ? page.data.localizeHref(data.view['@id']) : undefined);
</script>

{#snippet label()}
	<span class={'label truncate'}>
		{#if typeof data.label === 'object'}
			{#if data.label.decorated}
				<DecoratedDataLite data={data.label.decorated} />
			{:else}
				{data.label.str}
			{/if}
			{#if data.label.discriminator?.length}
				<span class="text-subtle text-4xs">({data.label.discriminator})</span>
			{/if}
		{:else}
			{data.label}
		{/if}
	</span>
{/snippet}

<div
	class={[
		'flex min-h-9 w-full items-stretch justify-between text-sm',
		level === 1 && 'text-subtle hover:text-body min-h-10 font-medium',
		level > 1 && 'text-subtle/85 hover:text-subtle focus-within:text-subtle pl-4',
		data?.selected && 'underline'
	]}
>
	{#if data.view}
		<a
			{href}
			class={[
				'hover:bg-accent-50/50 flex w-full min-w-0 items-center justify-between gap-2 rounded-md px-3'
			]}
			data-sveltekit-preload-data="false"
		>
			{@render label()}
			{#if data.totalItems && (data.parentFacet?.operator === 'OR' || (data.parentFacet?.operator === 'AND' && !data.selected))}
				<span class="badge">
					{data.totalItems.toLocaleString(page.data.locale)}
					<span class="sr-only">
						{#if data.totalItems === 1}
							{page.data.t('search.hitsOne')}
						{:else}
							{page.data.t('search.hits')}
						{/if}
					</span>
				</span>
			{/if}
		</a>
	{:else}
		<div class={['flex items-center justify-between px-3']}>
			{@render label()}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";
</style>
