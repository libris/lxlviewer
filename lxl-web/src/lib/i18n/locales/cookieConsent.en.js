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
				linkedCategory: 'necessary'
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
