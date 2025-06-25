<script lang="ts">
	import TableOfContents from './TableOfContents.svelte';

	const tocItems = [
		{
			id: 'id-1',
			label: 'Länk 1'
		},
		{
			id: 'id-2',
			label: 'Länk 2'
		},
		{
			id: 'id-3',
			label: 'Länk 3'
		}
	];
</script>

<article class="@container">
	<div class="contents @7xl:hidden">
		<TableOfContents items={tocItems} mobile />
	</div>
	<div
		class="max-w-10xl mx-auto my-3 flex flex-col gap-3 sm:my-6 sm:gap-6 @3xl:grid @3xl:grid-cols-(--two-grid-cols) @7xl:grid-cols-(--three-grid-cols)"
	>
		<div class="px-3 sm:px-6 @3xl:pr-0">
			<div
				class="border-neutral aspect-3/2 max-h-96 w-full border-b bg-neutral-50 @3xl:aspect-square @3xl:border-none"
			>
				Image
			</div>
		</div>
		<div class="mx-auto w-full max-w-4xl px-3 sm:px-6 @3xl:pl-0">
			{#each { length: 5 }}
				<p class="not-first:mt-6">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ornare ut tortor ac
					sollicitudin. Nam semper neque nec pellentesque ultrices. Curabitur finibus aliquam
					consequat. Pellentesque adiste, urna ut volutpat placerat, elit dui tempus urna, id
					sagittis erat magna sit amet neque. Etiam sagittis congue lectus quis laoreet. Quisque
					pretium elit vitae sollicitudin dictum. Maecenas nibh enim, congue vel condimentum vitae,
					porttitor non eros. Nulla ultrices justo id elit varius congue. Suspendisse ultrices,
					tortor vitae pulvinar egestas, orci purus accumsan dui, eget ornare quam odio sit amet
					velit. Curabitur dignissim eros sit amet placerat. Donec nec nisl ante. Mauris eget justo
					augue. Quisque vitae elementum nibh.
				</p>
			{/each}
		</div>
		<div class=" pr-3 sm:pr-6">
			<aside class="sticky top-0 hidden @7xl:block">
				<TableOfContents items={tocItems} />
			</aside>
		</div>
	</div>
</article>

<style>
</style>
