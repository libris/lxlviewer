<script lang="ts">
	import { page } from '$app/stores';
</script>

<div><p>{$page.url.searchParams.toString()}</p></div>

<style>
	div {
		overflow: hidden;
	}
</style>
