<script lang="ts">
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
	<span class="lxl-qualifier lxl-qualifier-remove atomic">
		<a href={removeLink} tabindex="-1"> X </a>
	</span>
{/if}
