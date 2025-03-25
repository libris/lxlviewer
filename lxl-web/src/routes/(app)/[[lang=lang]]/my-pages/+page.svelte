<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import Libraries from '$lib/components/my-pages/Libraries.svelte';
</script>

<svelte:head>
	<title>{getPageTitle(page.data.t('header.myPages'))}</title>
</svelte:head>
<Libraries />
