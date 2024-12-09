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

<span class="lxl-qualifier-key atomic" data-qualifier-key={key}>
	{keyLabel}{operator}
</span>
{#if valueLabel}
	<span class="lxl-qualifier-value atomic" data-qualifier-value={value}>
		{valueLabel}
	</span>
{/if}
{#if valueLabel && removeLink}
	<span class="lxl-qualifier-remove">
		<a href={removeLink} tabindex="-1"> X </a>
	</span>
{/if}

<style>
	.lxl-qualifier-key,
	.lxl-qualifier-value,
	.lxl-qualifier-remove {
		user-select: none;
	}
</style>
