<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import LangPicker from '$lib/components/LangPicker.svelte';
	import '../../../app.css';

	export let data;
</script>

<svelte:head>
	<base href={data.base} />
</svelte:head>
<header class="m-3 flex">
	<div class="flex-1">
		<a href={data.base}>Libris</a>
		<Search />
	</div>
	<LangPicker />
</header>
<slot />
