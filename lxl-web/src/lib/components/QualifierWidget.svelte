<script lang="ts">
	import type { Qualifier } from '$lib/utils/supersearch/qualifiers';
	import IconPerson from '~icons/mdi/person-circle';
	import IconRemove from '~icons/mdi/remove';

	type QualifierWidgetProps = {
		qualifier: Qualifier;
		onremove: () => void;
	};

	let { qualifier, onremove }: QualifierWidgetProps = $props();
</script>

<span class="qualifier">
	<span class="type">{qualifier.typeLabel}:</span><span class="value">
		{#if qualifier?.type === 'Person'}
			<IconPerson />
		{/if}
		{qualifier.valueLabel || qualifier.value}
	</span>
	<button onclick={onremove} tabindex="-1"><IconRemove style="font-size:14px;" /></button>
</span>&nbsp;

<style>
	.qualifier {
		display: inline-flex;
		align-items: center;
		border: 1px solid var(--border-color);
		border-radius: 3px;
		background: rgba(14, 113, 128, 0.15);
		padding: 0;
		max-width: 50vw;
		overflow: hidden;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
	}

	.type {
		display: inline-block;
		padding-right: var(--padding-2xs);
		padding-left: var(--padding-2xs);
		font-size: var(--font-size-2xs);
		&::first-letter {
			text-transform: capitalize;
		}
	}

	.value {
		display: inline-flex;
		align-items: center;
		align-self: stretch;
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

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: none;
		padding: 1px;
		min-width: 24px;
		min-height: 24px;
		color: var(--color-link);
	}
</style>
