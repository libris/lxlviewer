export interface MatomoTracker {
	// Using the Tracker Object

	/** Log a page view */
	trackPageView: (customTitle?: string) => void;
	/**
	 * Log an event with an event category (Videos, Music, Games...), an event
	 *  action (Play, Pause, Duration, Add Playlist, Downloaded, Clicked...), and an
	 *  optional event name and optional numeric value.
	 * */
	trackEvent: (category: string, action: string, name?: string, value?: number) => void;
	/**
	 * Install link tracking on all applicable link elements.
	 * Set the enable parameter to true to use pseudo click-handler (treat middle click and open contextmenu as left click).
	 * A right click (or any click that opens the context menu) on a link will be tracked as clicked even if "Open in new tab" is not selected.
	 * If "false" (default), nothing will be tracked on open context menu or middle click.
	 */
	enableLinkTracking: (enable?: boolean) => void;

	// Configuration of the Tracker Object

	/** Override the page's reported URL */
	setCustomUrl: (url: string) => void;

	// Managing Consent

	/** By default, the Matomo tracker assumes consent to tracking. To change this
	 *  behavior so nothing is tracked until a user consents, you must call
	 *  requireConsent. */
	requireConsent: () => void;
	/**
	 * By default the Matomo tracker assumes consent to using cookies.
	 * To change this behavior so no cookies are used by default,
	 * you must call requireCookieConsent.
	 */
	requireCookieConsent: () => void;
	/**
	 * Remove a user's consent, both if the consent was one-time only and if the consent was remembered.
	 * After calling this method, the user will have to consent again in order to be tracked.
	 */
	forgetConsentGiven: () => void;
	/**
	 * Remove a user's cookie consent, both if the consent was one-time only and if the consent was remembered.
	 * After calling this method, the user will have to consent again in order for cookies to be used.
	 */
	forgetCookieConsentGiven: () => void;
	/**
	 * Mark that the current user has consented to using cookies, and remembers this consent through a browser cookie.
	 * The next time the user visits the site, Matomo will remember that they consented, and use cookies.
	 * If you call this method, you do not need to call setCookieConsentGiven.
	 */
	rememberCookieConsentGiven: (hoursToExpire: number) => void;
	/**
	 * Mark that the current user has consented, and remembers this consent through a browser cookie.
	 * The next time the user visits the site, Matomo will remember that they consented, and track them.
	 * If you call this method, you do not need to call setConsentGiven
	 */
	rememberConsentGiven: (hoursToExpire: number) => void;
}
