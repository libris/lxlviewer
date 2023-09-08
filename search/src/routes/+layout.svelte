<script>
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import './styles.scss';

	$: home = $page.url.pathname === '/';
</script>

<Header withSearch={!home} sticky={!home} />
<slot />
