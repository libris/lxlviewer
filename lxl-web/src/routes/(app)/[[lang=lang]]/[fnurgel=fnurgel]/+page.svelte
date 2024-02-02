<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';

	export let data;
</script>

<h1 class="text-6-cond-extrabold"><DecoratedData data={data.page[LxlLens.PageHeading]} /></h1>
<DecoratedData data={data.page[LxlLens.PageOverView]} />
<DecoratedData data={data.page[LxlLens.PageDetails]} />
<pre>{JSON.stringify(data.foo, null, 2)}</pre>
