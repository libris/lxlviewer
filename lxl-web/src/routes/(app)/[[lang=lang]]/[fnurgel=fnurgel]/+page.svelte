<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';

	export let data;
</script>

<h1>{data.fnurgel}</h1>
<DecoratedData data={data.foo.card_decorated}></DecoratedData>
<pre>{JSON.stringify(data.foo, null, 2)}</pre>
