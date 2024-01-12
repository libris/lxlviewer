<script lang="ts">
	export let key: string | undefined;
	export let value: string | number | boolean | null;
</script>

{#if key === 'familyName'}
	<span class="familyName">
		{value}
	</span>
{:else}
	{value}
{/if}

<style>
	.familyName {
		color: red;
	}
</style>
