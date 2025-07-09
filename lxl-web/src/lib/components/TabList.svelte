<script lang="ts">
	const { tabs, tabContent, ...restProps } = $props();
</script>

<div class="flex gap-2" role="tablist" {...restProps}>
	{#each tabs as tab, index (index)}
		<button
			id={'tab-' + tab.targetId}
			class="relative content-center"
			role="tab"
			aria-controls={tab.targetId}
			aria-selected={tab.active}
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
			border-radius: 20px;
		}
	}

	[role='tab'][aria-selected='true']::after {
		background-color: var(--color-accent);
	}
</style>
