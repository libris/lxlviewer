<script lang="ts">
	import { page } from '$app/stores';
</script>

<div>
	<p>{$page.url.searchParams.toString()}</p>
	<pre>{JSON.stringify($page.data.searchMappings, null, 2)}</pre>
</div>

<style>
	div {
		overflow: hidden;
	}
</style>
