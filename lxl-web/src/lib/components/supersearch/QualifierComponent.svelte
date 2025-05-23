<script lang="ts">
	import { type QualifierComponentProps } from 'supersearch';
	import IconClose from '~icons/bi/x-lg';

	const { key, keyLabel, operator, value, valueLabel, removeQualifierFn }: QualifierComponentProps =
		$props();

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
		<IconClose />
	</button>
{/if}
