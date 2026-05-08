<script lang="ts">
	import KbLogo from '$lib/assets/img/kb_logo_text_black.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import * as CookieConsent from 'vanilla-cookieconsent';
</script>

<footer
	class="mt-auto flex flex-col justify-between gap-8 bg-neutral-100 px-4 py-8 sm:flex-row sm:px-8"
>
	<div class="flex flex-col gap-4 sm:flex-row sm:gap-16 [&_li>*]:text-sm [&_p]:font-medium">
		<nav class="flex flex-col gap-2" aria-labelledby="nav-info">
			<p id="nav-info">
				{page.data.t('footer.information')}
			</p>
			<ul>
				<li>
					<a href={resolve(page.data.localizeHref('/about'))}>{page.data.t('footer.about')}</a>
				</li>
				<li>
					<a
						href="https://www.kb.se/samverkan-och-utveckling/libris/fragor-och-svar-om-libris-nya-soktjanst.html"
						>{page.data.t('footer.faq')}</a
					>
				</li>
				<li>
					<button onclick={CookieConsent.showPreferences}>{page.data.t('footer.cookies')}</button>
				</li>
				<li>
					<a href="https://www.kb.se/om-oss/hantering-av-personuppgifter#Librissok"
						>{page.data.t('footer.gdpr')}</a
					>
				</li>
				<li>
					<a
						href="https://www.kb.se/om-oss/tillganglighet-pa-kbs-webbplatser-och-digitala-tjanster.html#item_125b5507eb18cedffd1a436125_45b5507eb18cedffd1a4317ec"
						>{page.data.t('appMenu.accessibilityStatement')}</a
					>
				</li>
			</ul>
		</nav>
		<nav class="flex flex-col gap-2" aria-labelledby="nav-shortcuts">
			<p id="nav-shortcuts">{page.data.t('footer.shortcuts')}</p>
			<ul>
				<li>
					<a href={resolve(page.data.localizeHref('/help/search'))}>{page.data.t('appMenu.help')}</a
					>
				</li>
				<li>
					<a href="https://gamla.libris.kb.se/">{page.data.t('appMenu.oldSite')}</a>
				</li>
				<li>
					<a href="https://iller.libris.kb.se/librisfjarrlan/">{page.data.t('appMenu.illSite')}</a>
				</li>
			</ul>
		</nav>
		<nav class="flex flex-col gap-2" aria-labelledby="nav-contact">
			<p id="nav-contact">{page.data.t('footer.contact')}</p>
			<ul>
				<li>
					<a
						href="https://www.kb.se/om-oss/kontakta-oss#item_125b5507eb18cedffd1a43f869_45b5507eb18cedffd1a4321f3"
						>{page.data.t('footer.customerSupport')}</a
					>
				</li>
			</ul>
		</nav>
	</div>
	<div class="flex items-end">
		<img class="h-20 w-auto" alt={page.data.t('footer.logo')} src={KbLogo} />
	</div>
</footer>
