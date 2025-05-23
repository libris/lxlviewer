<script lang="ts">
	import { type QualifierWidgetProps } from 'supersearch';
	import IconClose from '~icons/bi/x-lg';

	const { key, keyLabel, operator, value, valueLabel, removeQualifierFn }: QualifierWidgetProps =
		$props();

	const hasRemoveBtn = $derived(
		((keyLabel && operator && valueLabel) ||
			// filter alias
			(!keyLabel && !operator && valueLabel)) &&
			removeQualifierFn
	);

	const resourceLink = value?.match(/([a-z0-9]{15})#it"$/m)?.[1]; // only create links for fnurgels for now (lang:sv and similar should also be linkable in the future...)
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
		{#if resourceLink}
			<span class="hidden">{valueLabel}</span><a href={`/${resourceLink}`} class="link inline-block"
				>{valueLabel}</a
			>
		{:else}
			{valueLabel}
		{/if}
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

<style lang="postcss">
	@media (hover: none) {
		.lxl-qualifier.atomic > a {
			display: none;
		}

		.lxl-qualifier.atomic > span {
			display: inline;
		}
	}
</style>
