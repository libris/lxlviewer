<script lang="ts">
	import { page } from '$app/state';
	import { getCategoryShortcuts } from '$lib/remotes/homepage.remote';
</script>

<section
	class="bg-primary-100 border-y-primary-200 flex flex-col items-center border-y px-3 py-3 @5xl:px-20"
>
	<h3 class="text-subtle px-3 font-serif text-base italic lg:text-lg @3xl:max-w-max @5xl:text-xl">
		<strong class="font-normal">Libris</strong>
		{page.data.t('home.pageHeadingDescription')}
	</h3>
	<div class="w-full">
		<nav class="pt-2 pb-4 @5xl:pt-3 @5xl:pb-5" aria-labelledby="explore-categories">
			<div class="flex w-full items-center justify-center">
				<div
					tabindex="-1"
					class="filters-scroller scrollbar-hidden flex items-center overflow-x-scroll px-3 py-1 @3xl:px-4"
				>
					<h4
						id="explore-categories"
						class="mr-3 hidden font-serif font-medium whitespace-nowrap @xl:block @5xl:text-[1.0625rem]"
					>
						{page.data.t('search.exploreCategories')}
					</h4>
					<ul class="flex gap-2 pr-3 text-xs @3xl:text-sm @5xl:text-[0.9375rem]">
						{#each await getCategoryShortcuts(page.data.locale) as category (category.id)}
							<li>
								<a
									href={page.data.localizeHref(category.href)}
									id={category.id}
									aria-labelledby="search-for {category.id}"
									class="btn-outlined text-primary-900 border-primary-600/75 focus-visible:bg-primary-200 hover:bg-primary-200/50 min-w-12 px-2 py-1.5 text-center whitespace-nowrap @xl:px-3 @xl:py-2 @3xl:min-w-14 @5xl:min-h-10 @5xl:min-w-16"
								>
									{category.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</nav>
	</div>
</section>

<style lang="postcss">
	@reference 'tailwindcss';

	.filters-scroller {
		position: relative;
		mask-image: linear-gradient(
			to right,
			rgba(0, 0, 0, 0) calc(var(--spacing) * 0),
			rgba(0, 0, 0, 1) calc(var(--spacing) * 3),
			rgba(0, 0, 0, 1) calc(100% - var(--spacing) * 8),
			rgba(0, 0, 0, 0) calc(100% - var(--spacing) * 3)
		);

		@variant @3xl {
			mask-image: linear-gradient(
				to right,
				rgba(0, 0, 0, 0) calc(var(--spacing) * 0),
				rgba(0, 0, 0, 1) calc(var(--spacing) * 4),
				rgba(0, 0, 0, 1) calc(100% - var(--spacing) * 9),
				rgba(0, 0, 0, 0) calc(100% - var(--spacing) * 3)
			);
		}
	}
</style>
