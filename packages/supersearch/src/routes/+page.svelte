<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';

	let value = $state('');
	let placeholder = $state('Search');
</script>

<form action="find">
	<SuperSearch bind:value {placeholder} />
	<textarea {value} hidden readonly name="q" maxlength={2048}></textarea>
</form>
<label>Placeholder:<input type="text" bind:value={placeholder} /></label>
