<script>
	import { page } from '$app/stores';
</script>

<div class="m-auto flex max-w-[480px] flex-col p-8 text-center">
	<div class="pb-8">
		<a href="/" class="inline-block no-underline">
			<h1 class="text-3xl font-bold text-primary">Libris</h1>
		</a>
	</div>
	<h1 class="text-6-cond-extrabold">{$page.status}</h1>
	{#if $page.status === 404}
		<h2 class="pb-4 text-lg">Sidan kunde inte hittas</h2>
		<p>Klickade du på en länk i Libris som inte fungerade?</p>
		<p>
			Skicka e-post till
			<a
				href="mailto:libris@kb.se?subject=Felaktig länk&body=Felaktig referens till sidan {$page.url
					.href}">Libris kundservice</a
			>, så undersöker vi felet.
		</p>
		<p class="pt-4">
			<a href="/">Tillbaka till startsidan</a>
		</p>
	{:else}
		<p class="text-secondary">{$page.error?.message}</p>
	{/if}
</div>
