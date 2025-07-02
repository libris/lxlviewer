<script lang="ts">
	import { page } from '$app/state';
	import IconToC from '~icons/bi/list-ul';

	type Props = {
		items: { id: string; label: string }[];
		mobile?: boolean;
	};

	let { items, mobile = false }: Props = $props();
</script>

{#snippet tocList()}
	<ul>
		{#each items as { id, label } (label)}
			<li><a href="{page.url.pathname}#{id}">{label}</a></li>
		{/each}
	</ul>
{/snippet}

{#if mobile}
	<div class="border-b-neutral border-b">
		<label
			class="bg-page text-2xs text-subtle flex h-11 cursor-pointer items-center gap-1.5 px-3 sm:px-6 has-checked:[&+nav]:block"
		>
			<IconToC class="size-4" />
			{page.data.t('tableOfContents.onThisPage')}
			<input type="checkbox" role="button" aria-haspopup="true" class="h-0 appearance-none" />
		</label>
		<nav class="bg-page hidden px-3 sm:px-6">
			{@render tocList()}
		</nav>
	</div>
{:else}
	<header class="text-subtle text-sm font-medium">
		{page.data.t('tableOfContents.onThisPage')}
	</header>
	<nav class="text-subtle text-sm">{@render tocList()}</nav>
{/if}
