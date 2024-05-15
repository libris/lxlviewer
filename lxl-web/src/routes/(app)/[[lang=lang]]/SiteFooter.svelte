<script lang="ts">
	import KbLogo from '$lib/assets/img/kb_logo_text_black.svg';
	import { page } from '$app/stores';
</script>

<footer
	class="flex flex-col justify-between gap-8 bg-primary/4 p-8 text-secondary text-3-regular sm:flex-row lg:p-16"
>
	<div class="flex flex-col gap-8 sm:flex-row sm:gap-16">
		<nav class="flex flex-col gap-4" aria-labelledby="nav-info">
			<p id="nav-info" class="text-primary text-4-cond-bold">
				{$page.data.t('footer.information')}
			</p>
			<ul>
				<li>
					<a href="http://kb.se/libris">{$page.data.t('footer.faq')}</a>
				</li>
			</ul>
		</nav>
		<nav class="flex flex-col gap-4" aria-labelledby="nav-contact">
			<p id="nav-contact" class="text-primary text-4-cond-bold">{$page.data.t('footer.contact')}</p>
			<ul>
				<li>
					<a href="https://www.kb.se/om-oss/kontakta-oss/#item-47bef1f3916eca87a61b1eed"
						>{$page.data.t('footer.customerSupport')}</a
					>
				</li>
				<li>
					<a href="/">{$page.data.t('footer.feedback')}</a>
				</li>
			</ul>
		</nav>
	</div>
	<div class="flex items-end">
		<img class="h-20 w-auto md:h-24 lg:h-28" alt={$page.data.t('footer.logo')} src={KbLogo} />
	</div>
</footer>
