<script lang="ts">
	let { references } = $props();
</script>

<div>
	{#if references}
		{#await references}
			<p>laddar...</p>
		{:then r}
			<p>Klart! {r}</p>
			{console.log(r)}
		{:catch}
			<p>Oh no</p>
		{/await}
	{:else}
		<p>Kunde inte hämta referenser</p>
	{/if}
</div>
