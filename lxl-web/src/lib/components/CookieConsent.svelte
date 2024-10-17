<script lang="ts">
	import { onMount } from 'svelte';
	import * as CookieConsent from 'vanilla-cookieconsent';
	import 'vanilla-cookieconsent/dist/cookieconsent.css';
	import svTranslations from '$lib/i18n/locales/cookieConsent.sv';
	import enTranslations from '$lib/i18n/locales/cookieConsent.en';
	import { page } from '$app/stores';
	import { getMatomoTracker } from '$lib/contexts/matomo';

	const matomoTracker = getMatomoTracker();

	const config: CookieConsent.CookieConsentConfig = {
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
				$matomoTracker.rememberConsentGiven();
			}
		},
		onChange: ({ cookie }) => {
			if (cookie.categories.includes('analytics')) {
				$matomoTracker.rememberConsentGiven();
			} else {
				$matomoTracker.forgetConsentGiven();
			}
		},
		language: {
			default: $page.data.locale,
			translations: {
				sv: svTranslations,
				en: enTranslations
			}
		}
	};

	onMount(() => {
		CookieConsent.run(config);
	});
</script>

<style lang="postcss">
	/* heading */
	:global(#cc-main .cm__title, #cc-main .pm__title) {
		@apply text-primary text-4-cond-bold;
	}

	/* subheading */
	:global(#cc-main .pm__section-title) {
		@apply text-primary text-3-cond;
	}

	/* body text */
	:global(#cc-main .cm__desc, #cc-main .pm__section-desc) {
		@apply text-primary text-2-regular;
	}

	/* btns */
	:global(#cc-main .cm__btn, #cc-main .pm__btn) {
		@apply text-3-cond;
	}
</style>
