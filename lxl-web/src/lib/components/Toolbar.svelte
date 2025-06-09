<script lang="ts">
	import type { Snippet } from 'svelte';

	type ToolbarProps = {
		leadingActions?: Snippet;
		centerActions?: Snippet;
		trailingActions?: Snippet;
	};

	let { leadingActions, centerActions, trailingActions }: ToolbarProps = $props();
</script>

<div class="h-[var(--toolbar-height)] content-center border-b border-b-neutral-200 px-3">
	<ul class="grid grid-cols-3 grid-rows-1">
		<li class="justify-self-start">
			{#if leadingActions}
				{@render leadingActions()}
			{/if}
		</li>

		<li class="justify-self-center">
			{#if centerActions}
				{@render centerActions()}
			{/if}
		</li>

		<li class="justify-self-end">
			{#if trailingActions}
				{@render trailingActions()}
			{/if}
		</li>
	</ul>
</div>
