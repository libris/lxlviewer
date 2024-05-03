<script>
	import { page } from '$app/stores';
</script>

<div class="p-8 text-center">
	<h1 class="mb-4 text-6-cond-extrabold">{$page.status}: {$page.error?.status}</h1>
	<p>{$page.error?.message}</p>
</div>
