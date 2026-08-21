<script lang="ts">
	import KbLogo from '$lib/assets/img/kb_logo_text_black.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import * as CookieConsent from 'vanilla-cookieconsent';
	import { FOOTER_COOKIES_HREF } from '$lib/types/site';

	const sections = $derived(page.data.footer);
</script>

<footer
	class="mt-auto flex flex-col justify-between gap-8 bg-neutral-100 px-4 py-8 sm:flex-row sm:px-8 print:hidden"
>
	<div class="flex flex-col gap-4 sm:flex-row sm:gap-16 [&_li>*]:text-sm [&_p]:font-medium">
		{#each sections as section (section.id)}
			<nav class="flex flex-col gap-2" aria-labelledby={section.id}>
				<p id={section.id}>
					{#if section.titleKey}
						{page.data.t(section.titleKey)}
					{/if}
				</p>
				<ul>
					{#each section.items as item, index (index)}
						<li>
							{#if item.href && item.titleKey}
								{#if item.href === FOOTER_COOKIES_HREF}
									<button onclick={CookieConsent.showPreferences}>
										{page.data.t(item.titleKey)}
									</button>
								{:else if item.href?.startsWith('/')}
									<a href={resolve(page.data.localizeHref(item.href))}>
										{page.data.t(item.titleKey)}
									</a>
								{:else if item.href}
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a href={item.href}>{page.data.t(item.titleKey)}</a>
								{/if}
							{/if}
						</li>
					{/each}
				</ul>
			</nav>
		{/each}
	</div>
	<div class="flex items-end">
		<img class="h-20 w-auto" alt={page.data.t('footer.logo')} src={KbLogo} />
	</div>
</footer>
