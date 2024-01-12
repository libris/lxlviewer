<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import LangPicker from '$lib/components/LangPicker.svelte';
	import '../../../app.css';
</script>

<header class="mx-4 flex">
	<div class="flex-1">
		<a href="/">Libris</a>
		<Search />
	</div>
	<LangPicker />
</header>
<slot />
