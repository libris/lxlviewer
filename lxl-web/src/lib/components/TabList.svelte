<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		tabs: {
			targetId: string;
			active: boolean;
		}[];
		tabContent: Snippet;
		onclick: (id: string) => void;
	};
	const { tabs, tabContent, onclick, ...restProps }: Props = $props();
</script>

<div class="flex gap-2" role="tablist" {...restProps}>
	{#each tabs as tab, index (index)}
		<button
			id={'tab-' + tab.targetId}
			class="relative content-center"
			role="tab"
			aria-controls={tab.targetId}
			aria-selected={tab.active}
			onclick={() => onclick(tab.targetId)}
		>
			{@render tabContent(tab)}
		</button>
	{/each}
</div>

<style>
	[role='tablist'] {
		height: var(--toolbar-height);
	}

	[role='tab'] {
		&::after {
			position: absolute;
			content: '';
			width: 100%;
			height: 3px;
			background-color: transparent;
			left: 0;
			bottom: 0;
			border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		}
	}

	[role='tab'][aria-selected='true']::after {
		background-color: var(--color-accent);
	}
</style>
