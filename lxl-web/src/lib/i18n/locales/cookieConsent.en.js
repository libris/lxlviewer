export default {
	consentModal: {
		title: 'We use cookies',
		description:
			'Tjänsten Libris använder olika typer av kakor (cookies). Dessa är till för att förbättra användarupplevelsen samt för att tjänsten och dess funktioner ska fungera som de ska. Nedan kan du välja dina inställningar för vilka kakor du ger ditt samtycke till. Du kan alltid ändra dina val senare genom att klicka på “Hantera cookies” längst ner på sidan.',
		acceptAllBtn: 'Accept all cookies',
		acceptNecessaryBtn: 'Accept only necessary',
		showPreferencesBtn: 'Manage Individual preferences'
	},
	preferencesModal: {
		title: 'Cookie settings',
		acceptAllBtn: 'Accept all cookies',
		acceptNecessaryBtn: 'Accept only necessary',
		savePreferencesBtn: 'Manage individual preferences',
		closeIconLabel: 'Close',
		sections: [
			{
				title: 'Your Privacy Choices',
				description:
					'Webbplatsen Libris använder kakor (cookies). En kaka är en liten textfil som lagras i besökarens dator. KB:s tjänster är designade för att minska risken för spridning av uppgifter om vad du söker efter och tittar på till andra. Informationen som lagras via kakor kan inte användas av tredje part i marknadsföringssyfte.'
			},
			{
				title: 'Strictly Necessary cookies',
				description:
					'These cookies are essential for the proper functioning of the website and cannot be disabled.',
				linkedCategory: 'necessary'
			},
			{
				title: 'Analytical cookies',
				description:
					'These cookies collect information about how you use our website, allowing us to improve the user experience.',
				linkedCategory: 'analytics'
			},
			{
				title: 'More information',
				description:
					'You can always review your choices by clicking "Manage cookies" in the site footer.'
			}
		]
	}
};
