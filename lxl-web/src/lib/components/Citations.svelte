<script lang="ts">
	let { citations } = $props();
</script>

<div>
	{#if citations}
		{#await citations}
			<p>laddar...</p>
		{:then c}
			<p>Klart! {c}</p>
			{console.log(c)}
		{:catch}
			<p>Oh no</p>
		{/await}
	{:else}
		<p>Kunde inte hämta referenser</p>
	{/if}
</div>
