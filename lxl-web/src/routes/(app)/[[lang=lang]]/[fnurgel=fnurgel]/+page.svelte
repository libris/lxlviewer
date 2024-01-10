<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>{data.fnurgel} på {data.lang}</h1>
<h2>{data.iri}</h2>
<p>{JSON.stringify(data)}</p>
