<script lang="ts">
	import { page } from '$app/state';
	import { getCategoryShortcuts } from '$lib/remotes/homepage.remote';
</script>

<section class="flex flex-col items-center">
	<div class="w-full">
		<nav aria-labelledby="explore-categories">
			<div
				class="flex flex-col gap-2 pl-3 @sm:pl-6 @3xl:gap-3 @5xl:pl-20 lg:@7xl:flex-row lg:@7xl:items-center"
			>
				<h2
					id="explore-categories"
					class="mr-3 font-serif text-lg whitespace-nowrap italic @lg:text-xl @3xl:text-2xl lg:@7xl:text-xl"
				>
					{page.data.t('search.exploreCategories')}
				</h2>
				<div
					tabindex="-1"
					class="scrollbar-hidden flex min-h-11 items-center overflow-x-scroll lg:overflow-x-auto lg:px-0"
				>
					<ul class="flex gap-2 text-sm @5xl:text-base">
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
<hr class="mx-20 my-6 hidden border-neutral-300 @7xl:block" />

<style lang="postcss">
	@reference 'tailwindcss';
</style>
