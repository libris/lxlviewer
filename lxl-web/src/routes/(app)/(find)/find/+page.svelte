<script lang="ts">
	import { page } from '$app/stores';
</script>

<p>{$page.url.searchParams.toString()}</p>
