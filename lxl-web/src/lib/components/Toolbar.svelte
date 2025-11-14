<script lang="ts">
	import type { Snippet } from 'svelte';

	type ToolbarProps = {
		leadingActions?: Snippet;
		trailingActions?: Snippet;
		children?: Snippet;
	};

	let { leadingActions, trailingActions, children }: ToolbarProps = $props();
</script>

<div
	class="toolbar flex place-content-between items-center gap-2 overflow-hidden border-b border-b-neutral-200 px-2 lg:px-3"
>
	{#if leadingActions}
		<div class="flex gap-1">
			{@render leadingActions()}
		</div>
	{/if}
	{@render children?.()}

	{#if trailingActions}
		<div class="ml-auto flex gap-1">
			{@render trailingActions()}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	.toolbar {
		height: var(--toolbar-height);
	}
</style>
