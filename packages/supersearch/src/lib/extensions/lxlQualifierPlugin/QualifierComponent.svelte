<script lang="ts">
	import IconClear from './IconClear.svelte';

	interface Props {
		key: string;
		keyLabel?: string;
		keyType?: string;
		value?: string;
		valueLabel?: string;
		operator: string;
		operatorType?: string;
		removeLink?: string;
	}

	const { key, keyLabel, operator, value, valueLabel, removeLink }: Props = $props();
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
{#if valueLabel && removeLink}
	<a href={removeLink} class="lxl-qualifier lxl-qualifier-remove atomic" aria-label="clear">
		<IconClear />
	</a>
{/if}
