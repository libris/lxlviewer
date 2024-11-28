<script lang="ts">
	interface Props {
		key: string;
		operator: string;
		label?: string;
		keyType?: string;
		operatorType?: string;
	}

	const { key, operator, label }: Props = $props();
</script>

<span class="lxl-qualifier-key" data-qualifier-key={key}>
	{label || key}{operator}
</span>

<style>
	.lxl-qualifier-key {
		user-select: none;
	}
</style>
