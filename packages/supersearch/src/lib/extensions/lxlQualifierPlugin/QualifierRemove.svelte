<script lang="ts">
	interface Props {
		range: { from: number; to: number };
		url: URL;
	}

	let { range, url }: Props = $props();
	// FIX: no hardcoded _q
	let removeUrl = $derived.by(() => {
		const _q = url.searchParams.get('_q');
		if (_q) {
			url.searchParams.set('_q', _q.slice(0, range.from) + _q.slice(range.to));
		}
		return url;
	});
</script>

<span class="lxl-qualifier-remove">
	<a href={removeUrl.toString()} tabindex="-1">
		<!-- <IconClose style="font-size:14px;" /> -->
		X
	</a>
</span>
