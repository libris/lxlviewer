<script lang="ts">
	import { page } from '$app/state';
	import { getCategoryShortcuts } from '$lib/remotes/homepage.remote';
</script>

<nav
	aria-label={page.data.t('home.categories')}
	class="scrollbar-hidden flex items-center justify-center overflow-x-scroll"
>
	<ul class="flex gap-2 text-sm @5xl:text-[0.9375rem]">
		<li>
			<a
				href={page.data.localizeHref('/find')}
				class="btn-outlined text-primary-900 border-primary-600/75 focus-visible:bg-primary-200 hover:bg-primary-200/50 min-w-12 px-2 py-1.5 text-center whitespace-nowrap @xl:px-3 @xl:py-2 @3xl:min-w-14 @5xl:min-h-10 @5xl:min-w-16"
			>
				{page.data.t('home.all')}
			</a>
		</li>
		{#each await getCategoryShortcuts(page.data.locale) as category (category.id)}
			<li>
				<a
					href={page.data.localizeHref(category.href)}
					id={category.id}
					aria-labelledby="search-for {category.id}"
					class="btn-outlined text-primary-900 focus-visible:bg-primary-200 hover:bg-primary-200/50 min-w-12 border-transparent px-2 py-1.5 text-center whitespace-nowrap @xl:px-3 @xl:py-2 @3xl:min-w-14 @5xl:min-h-10 @5xl:min-w-16"
				>
					{category.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
