<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
	import IconClear from '~icons/bi/x-lg';
	import type { TreeItemSnippetParams } from '$lib/types/treeview';

	let { data, level, onchangeselected, ...props }: TreeItemSnippetParams = $props();

	const href = $derived(data.view ? page.data.localizeHref(data.view['@id']) : undefined);
	let selected = $derived(props?.selected);
	const hasCheckbox = $derived(true);

	function toggleSelected() {
		if (hasCheckbox) {
			selected = !selected;
			onchangeselected(selected);
		}
		goto(href);
	}

	function handleCheckboxKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (event.key === 'Enter') {
			event.currentTarget.click();
		}
	}
</script>

{#snippet label()}
	<span class="label truncate">
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
		'facet-item flex min-h-10 w-full items-stretch justify-between text-[15px]',
		level === 1 && 'text-subtle hover:text-body font-medium',
		level > 1 && 'text-subtle/85 hover:text-subtle focus-within:text-subtle'
	]}
>
	{#if data.view}
		<div class="flex w-full items-center">
			{#if hasCheckbox}
				<input
					type="checkbox"
					class="cursor-pointer hover:[&+a]:underline"
					bind:checked={selected}
					onclick={toggleSelected}
					onkeydown={handleCheckboxKeydown}
				/>
			{/if}
			<a
				{href}
				class={[
					'flex w-full min-w-0 items-center justify-between gap-2 hover:underline',
					selected && 'underline',
					hasCheckbox && 'pl-1.5'
				]}
				tabindex={hasCheckbox ? -1 : undefined}
				onclick={(event) => {
					event.preventDefault();
					toggleSelected();
				}}
				data-sveltekit-preload-data="false"
			>
				{@render label()}
				{#if data.totalItems && (data.parentFacet?.operator === 'OR' || (data.parentFacet?.operator === 'AND' && !selected))}
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
				{#if selected && !hasCheckbox}
					<IconClear class="size-3.5" />
				{/if}
			</a>
		</div>
	{:else}
		<div class={['flex items-center justify-between']}>
			{@render label()}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.facet-item {
		padding-left: calc(var(--level, 0) * var(--spacing) * 4);
	}
</style>
