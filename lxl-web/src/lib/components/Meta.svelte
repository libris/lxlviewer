<script lang="ts">
	type Props = {
		title?: string;
		description?: string;
		image?: string;
		url?: string;
		siteName?: string;
		type?: string;
	};

	let { title, description, image, url, siteName, type }: Props = $props();
</script>

<svelte:head>
	{#if description}
		<meta name="description" content={description} />
	{/if}

	{#if title}
		<meta property="og:title" content={title} />
	{/if}

	{#if description}
		<meta property="og:description" content={description} />
	{/if}

	{#if type}
		<meta property="og:type" content={type} />
	{/if}

	{#if url}
		<meta property="og:url" content={url} />
	{/if}

	{#if siteName}
		<meta property="og:site_name" content={siteName} />
	{/if}

	{#if image}
		<meta property="og:image" content={image} />
	{/if}
</svelte:head>
