<script lang="ts">
	import { page } from '$app/state';

	import TableOfContents from './TableOfContents.svelte';
	import ResourceImage from './ResourceImage.svelte';
	import { type SecureImage, Width as ImageWidth } from '$lib/types/auxd';

	type Props = {
		type: string | undefined;
		images: SecureImage[];
	};

	const { type, images }: Props = $props();

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
		class="max-w-10xl wide:max-w-screen mx-auto flex flex-col gap-3 p-3 sm:gap-6 sm:p-6 @3xl:grid @3xl:grid-cols-(--two-grid-cols) @7xl:grid-cols-(--three-grid-cols)"
	>
		<div class="order-last hidden @7xl:block">
			<aside class="sticky top-6">
				<TableOfContents items={tocItems} />
			</aside>
		</div>
		<div>
			<div class="sticky top-6">
				<ResourceImage
					{images}
					{type}
					alt={page.data.t('general.latestInstanceCover')}
					thumbnailTargetWidth={ImageWidth.MEDIUM}
					linkToFull
				/>
			</div>
		</div>
		<div class="wide:max-w-screen mx-auto w-full max-w-4xl">
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
			{#each { length: 3 }}
				<section class="-mx-3 sm:-mx-6 @3xl:mx-0">
					<ul
						class="scrollbar-hidden flex gap-3 overflow-x-auto overscroll-x-contain px-3 sm:px-6 @3xl:px-0"
					>
						{#each { length: 10 }}
							<li class="min-w-[192px] flex-1 text-sm">
								<div class="aspect-2/3 bg-neutral-100"></div>
								Lorem ipsum ad est dolors
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	</div>
</article>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
