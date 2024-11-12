<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';

	let placeholder = $state('Search');
</script>

<SuperSearch {placeholder} />

<label>Placeholder:<input type="text" bind:value={placeholder} /></label>
