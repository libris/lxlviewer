<script lang="ts">
	import '../../app.css';
	import { PUBLIC_SERVICE_NAME } from '$env/static/public';
	export let data;
</script>

<svelte:head>
	<title>{PUBLIC_SERVICE_NAME}</title>
	<base href={data.base} />
</svelte:head>
<slot />
