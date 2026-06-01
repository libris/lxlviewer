export default {
	consentModal: {
		title: 'We use cookies',
		description:
			'The Libris service uses various types of cookies. These are intended to enhance the user experience and ensure that the service and its functions work as they should. Below, you can choose your preferences for which cookies you consent to. You can always change your choices later by clicking on "Manage cookies" at the bottom of the page.',
		acceptAllBtn: 'Accept all cookies',
		acceptNecessaryBtn: 'Accept only necessary',
		showPreferencesBtn: 'Cookie settings'
	},
	preferencesModal: {
		title: 'Cookie settings',
		acceptAllBtn: 'Accept all cookies',
		acceptNecessaryBtn: 'Accept only necessary',
		savePreferencesBtn: 'Save and close',
		closeIconLabel: 'Close',
		sections: [
			{
				title: 'About the use of cookies',
				description:
					"The Libris website uses cookies. A cookie is a small text file that is stored on the visitor's computer. The National Library's services are designed to reduce the risk of your information being disseminated. The information stored via cookies can never be used by third parties for marketing purposes."
			},
			{
				title: 'Necessary cookies',
				description:
					'These cookies are essential for the proper functioning of the website and cannot be disabled.',
				linkedCategory: 'necessary',
				cookieTable: {
					title: 'Lista över kakor',
					headers: {
						name: 'Namn',
						description: 'Beskrivning',
						duration: 'Varaktighet'
					},
					body: [
						{
							name: 'userSettings',
							description:
								'Used to store your personal preferences, including any libraries you have saved ("Favourite libraries"), sort order, and layout preferences.',
							duration: '1 year'
						},
						{
							name: 'techaro.lol-anubis-auth',
							description:
								"Saved when your browser has passed a security check against automated bots. It means you don't have to go through the check again on each page visit.",
							duration: '1 week'
						},
						{
							name: 'techaro.lol-anubis-cookie-verification',
							description:
								'Used to check that your browser accepts cookies, which is required for the security check to work.',
							duration: '30 minutes'
						}
					]
				}
			},
			{
				title: 'Analytical cookies',
				description:
					'Cookies that provide us with information about how the website is used, allowing us to maintain, operate, and improve the user experience.',
				linkedCategory: 'analytics'
			},
			{
				title: 'More information',
				description:
					'You can always change your choices by clicking on "Manage cookies" at the bottom of the page in the footer.'
			}
		]
	}
};
