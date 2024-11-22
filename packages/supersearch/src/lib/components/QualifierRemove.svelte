<script lang="ts">
  import { page } from '$app/stores';

  let range = $props();
  	// FIX: no hardcoded _q
	let removeUrl = $derived.by(() => {
		const url = new URL($page.url);
		const _q = $page.url.searchParams.get('_q');
		if (_q) {
			url.searchParams.set('_q', _q.slice(0, range.from) + _q.slice(range.to));
		}
		return url;
	});

</script>
<span class="qualifier-remove">
	<a href={removeUrl.toString()} tabindex="-1">
		<!-- <IconClose style="font-size:14px;" /> -->
		X
	</a>
</span>


<style>
	.qualifier-remove {
		padding: 0 5px;
		display: inline-flex;
	}
</style>