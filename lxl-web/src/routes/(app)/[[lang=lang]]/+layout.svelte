<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import LangPicker from '$lib/components/LangPicker.svelte';
	import '../../../app.css';

	export let data;
</script>

<header class="mx-4 flex">
	<div class="flex-1">
		<a href={data.base || '/'}>Libris</a>
		<Search />
	</div>
	<LangPicker />
</header>
<slot />
