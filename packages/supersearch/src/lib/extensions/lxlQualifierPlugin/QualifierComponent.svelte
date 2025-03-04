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

	function onClickRemove(e: MouseEvent) {
		e.preventDefault();
		removeQualifierFn?.(key + operator + value);
	}
</script>

<span class="lxl-qualifier lxl-qualifier-key atomic" data-qualifier-key={key}>
	{keyLabel}
</span>
<span class="lxl-qualifier lxl-qualifier-operator atomic" data-qualifier-operator={operator}>
	{operator}
</span>
{#if valueLabel}
	<span class="lxl-qualifier lxl-qualifier-value atomic" data-qualifier-value={value}>
		{valueLabel}
	</span>
{/if}
{#if keyLabel && operator && valueLabel && removeQualifierFn}
	<button
		type="button"
		onclick={onClickRemove}
		class="lxl-qualifier lxl-qualifier-remove atomic"
		aria-label="clear"
	>
		<IconClear />
	</button>
{/if}
