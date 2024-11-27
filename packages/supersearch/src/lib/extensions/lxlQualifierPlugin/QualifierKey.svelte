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

<span class="qualifier-key" data-qualifier-key={key}>
	{label || key}{operator}
</span>

<style>
	.qualifier-key {
		user-select: none;
	}
</style>
