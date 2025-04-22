<script lang="ts">
	import IconClear from './IconClear.svelte';
	import type { RemoveQualifierFunction } from './index.js';

	interface Props {
		key: string;
		keyLabel?: string;
		keyType?: string;
		value?: string;
		valueLabel?: string;
		operator: string;
		operatorType?: string;
		removeQualifierFn?: RemoveQualifierFunction;
	}

	const { key, keyLabel, operator, value, valueLabel, removeQualifierFn }: Props = $props();

	const hasRemoveBtn = $derived(
		((keyLabel && operator && valueLabel) ||
			// filter alias
			(!keyLabel && !operator && valueLabel)) &&
			removeQualifierFn
	);
</script>

{#if keyLabel}
	<span class="lxl-qualifier lxl-qualifier-key atomic" data-qualifier-key={key}>
		{keyLabel}
	</span>
{/if}
{#if operator}
	<span class="lxl-qualifier lxl-qualifier-operator atomic" data-qualifier-operator={operator}>
		{operator}
	</span>
{/if}
{#if valueLabel}
	<span
		class={[
			'lxl-qualifier atomic',
			keyLabel && operator ? 'lxl-qualifier-value' : 'lxl-filter-alias'
		]}
		data-qualifier-value={value}
	>
		{valueLabel}
	</span>
{/if}
{#if hasRemoveBtn}
	<button
		type="button"
		onclick={() => removeQualifierFn?.(key + operator + value)}
		class="lxl-qualifier lxl-qualifier-remove atomic"
		aria-label="clear"
	>
		<IconClear />
	</button>
{/if}
