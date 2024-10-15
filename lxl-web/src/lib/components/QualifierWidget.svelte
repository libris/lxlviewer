<script lang="ts">
	import type { Qualifier } from '$lib/utils/supersearch/qualifiers';
	import IconPerson from '~icons/mdi/person-circle';

	type QualifierWidgetProps = {
		qualifier: Qualifier;
	};

	let { qualifier }: QualifierWidgetProps = $props();
</script>

<span class="qualifier">
	<span class="type">{qualifier.typeLabel}:</span><span class="value">
		{#if qualifier?.type === 'Person'}
			<IconPerson />
		{/if}
		{qualifier.valueLabel || qualifier.value}
	</span>
</span>&nbsp;

<style>
	.qualifier {
		display: inline-flex;
		gap: var(--gap-xs);
		border: 1px solid var(--border-color);
		border-radius: 3px;
		background: rgba(14, 113, 128, 0.15);
		padding: var(--padding-2xs);
		max-width: 50vw;
		overflow: hidden;
		overflow: hidden;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
	}

	.type {
		display: inline-block;
		font-size: var(--font-size-2xs);
		&::first-letter {
			text-transform: capitalize;
		}
	}

	.value {
		min-width: 0;
		overflow: hidden;
		color: #0e7180;
		font-size: var(--font-size-2xs);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.value :global(svg) {
		color: var(--color-link);
		font-size: var(--font-size-sm);
	}
</style>
