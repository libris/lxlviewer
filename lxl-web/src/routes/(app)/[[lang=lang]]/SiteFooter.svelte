<script lang="ts">
	import KbLogo from '$lib/assets/img/kb_logo_text_black.svg';
	import { page } from '$app/stores';
	import * as CookieConsent from 'vanilla-cookieconsent';
</script>

<footer class="mt-auto flex flex-col justify-between gap-8 bg-neutral-100 p-8 sm:flex-row lg:p-10">
	<div class="[&_a]:link-subtle flex flex-col gap-8 sm:flex-row sm:gap-16 [&_p]:font-medium">
		<nav class="flex flex-col gap-4" aria-labelledby="nav-info">
			<p id="nav-info">
				{$page.data.t('footer.information')}
			</p>
			<ul>
				<li>
					<a
						href="https://www.kb.se/samverkan-och-utveckling/libris/fragor-och-svar-om-libris-nya-soktjanst.html"
						>{$page.data.t('footer.faq')}</a
					>
				</li>
				<li>
					<button class="link-subtle" on:click={CookieConsent.showPreferences}
						>{$page.data.t('footer.cookies')}</button
					>
				</li>
			</ul>
		</nav>
		<nav class="flex flex-col gap-4" aria-labelledby="nav-contact">
			<p id="nav-contact">{$page.data.t('footer.contact')}</p>
			<ul>
				<li>
					<a href="https://www.kb.se/om-oss/kontakta-oss/#item-47bef1f3916eca87a61b1eed"
						>{$page.data.t('footer.customerSupport')}</a
					>
				</li>
				<li>
					<a href={$page.data.t('footer.feedbackLink')}>{$page.data.t('footer.feedback')}</a>
				</li>
			</ul>
		</nav>
	</div>
	<div class="flex items-end">
		<img class="h-20 w-auto md:h-20 lg:h-24" alt={$page.data.t('footer.logo')} src={KbLogo} />
	</div>
</footer>
