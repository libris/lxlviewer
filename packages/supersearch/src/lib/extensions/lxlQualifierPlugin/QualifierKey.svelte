<script lang="ts">
	interface Props {
		key: string;
		operator: string;
	}

	const { key, operator }: Props = $props();
</script>

<span class="qualifier-key-container">
	<span class="qualifier-key">
		{key}
	</span>
	<span class="qualifier-operator">
		{operator}
	</span>
</span>

<style>
	.qualifier-key-container {
		display: inline-flex;
	}
</style>
