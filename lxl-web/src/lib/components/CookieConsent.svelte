<script lang="ts">
	import { onMount } from 'svelte';
	import * as CookieConsent from 'vanilla-cookieconsent';
	import 'vanilla-cookieconsent/dist/cookieconsent.css';
	import '$lib/styles/cookieconsent.css';
	import svTranslations from '$lib/i18n/cookieConsent/sv';
	import enTranslations from '$lib/i18n/cookieConsent/en';
	import { page } from '$app/state';
	import { getMatomoTracker } from '$lib/contexts/matomo';
	import { getCookieConsentContext } from '$lib/contexts/cookieConsent';

	let cookieConsentContext = getCookieConsentContext();

	const matomoTracker = getMatomoTracker();

	const config: CookieConsent.CookieConsentConfig = {
		root: '#cookie-consent-container',
		guiOptions: {
			consentModal: {
				layout: 'bar',
				position: 'bottom right'
			},
			preferencesModal: {
				layout: 'box'
			}
		},
		categories: {
			necessary: {
				readOnly: true,
				enabled: true
			},
			analytics: {
				autoClear: {
					cookies: [
						{
							name: /^_pk.*/
						}
					]
				}
			}
		},
		onConsent: ({ cookie }) => {
			if (cookie.categories.includes('analytics')) {
				$matomoTracker?.rememberConsentGiven();
			}
		},
		onChange: ({ cookie }) => {
			if (cookie.categories.includes('analytics')) {
				$matomoTracker?.rememberConsentGiven();
			} else {
				$matomoTracker?.forgetConsentGiven();
			}
		},
		onModalShow: () => {
			cookieConsentContext.visibleModal = true;
		},
		onModalHide: () => {
			cookieConsentContext.visibleModal = false;
		},
		language: {
			default: page.data.locale,
			translations: {
				sv: svTranslations,
				en: enTranslations
			}
		}
	};

	onMount(() => {
		CookieConsent.run(config);
	});

	$effect(() => {
		CookieConsent.setLanguage(page.data.locale);
	});
</script>
