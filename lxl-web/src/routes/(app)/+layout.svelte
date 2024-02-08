<script lang="ts">
	import '../../app.css';
	export let data;
</script>

<svelte:head>
	<title>{data.settings.serviceName}</title>
	<base href={data.base} />
</svelte:head>
<slot />
