<script lang="ts">
	import { page } from '$app/stores';
	import getPageTitle from '$lib/utils/getPageTitle';
</script>

<svelte:head>
	<title>{getPageTitle($page.url.searchParams.get('_q')?.trim())}</title>
</svelte:head>
