<script lang="ts">
	import '../app.css';
	import '../themes.css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { setUserSettings } from '#lib/contexts/userSettings.js';
	import NProgress from 'nprogress';
	import '#lib/styles/nprogress.css';
	import Matomo from '#lib/components/Matomo.svelte';
	import CookieConsent from '#lib/components/CookieConsent.svelte';
	import { setCookieConsentContext } from '#lib/contexts/cookieConsent.js';
	import { setSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { setTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';
	import { setModalContext } from '#lib/contexts/modal.svelte.ts';
	import type { LocaleCode } from '#lib/i18n/locales.ts';

	const { children } = $props();

	NProgress.configure({
		//https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16,
		showSpinner: false
	});

	let cookieConsentState: { visibleModal: boolean | undefined } = $state({
		visibleModal: page.data.initialCookieConsentModal
	});

	setCookieConsentContext(cookieConsentState);
	const userSettings = setUserSettings(page.data.userSettings);

	const selection = setSelectionContext();
	selection.init(page.data.locale as LocaleCode, userSettings.selectedCitationFormat);

	setTrailingPaneContext();
	setModalContext();

	let progressBarTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
	const progressDelay = 300;

	beforeNavigate(({ shallow, type }) => {
		if (shallow && type === 'goto') return;

		clearTimeout(progressBarTimeout);
		progressBarTimeout = setTimeout(NProgress.start, progressDelay);
	});

	afterNavigate(({ shallow, type, from, to }) => {
		if (shallow && type === 'goto') return;
		if (from?.params?.lang !== to?.params?.lang) {
			selection?.init(page.data.locale as LocaleCode, userSettings.selectedCitationFormat);
		}

		clearTimeout(progressBarTimeout);
		NProgress.done();
	});
</script>

<div class="flex min-h-screen flex-col">
	<div id="cookie-consent-container" class="contents"><CookieConsent /></div>
	<Matomo>
		<svelte:boundary>{@render children()}</svelte:boundary>
	</Matomo>
</div>

<style>
</style>
