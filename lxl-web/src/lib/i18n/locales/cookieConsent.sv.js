// https://cookieconsent.orestbida.com/reference/configuration-reference.html#language-translations
export default {
	consentModal: {
		title: 'Vi använder kakor',
		description:
			'Tjänsten Libris använder olika typer av kakor (cookies). Dessa är till för att förbättra användarupplevelsen samt för att tjänsten och dess funktioner ska fungera som de ska. Nedan kan du välja dina inställningar för vilka kakor du ger ditt samtycke till. Du kan alltid ändra dina val senare genom att klicka på “Hantera cookies” längst ner på sidan.',
		acceptAllBtn: 'Tillåt alla kakor',
		acceptNecessaryBtn: 'Tillåt bara nödvändiga kakor',
		showPreferencesBtn: 'Inställningar'
	},
	preferencesModal: {
		title: 'Inställningar för kakor',
		acceptAllBtn: 'Tillåt alla kakor',
		acceptNecessaryBtn: 'Tillåt bara nödvändiga kakor',
		savePreferencesBtn: 'Spara och stäng',
		closeIconLabel: 'Stäng',
		sections: [
			{
				title: 'Om användning av kakor',
				description:
					'Webbplatsen Libris använder kakor (cookies). En kaka är en liten textfil som lagras i besökarens dator. KB:s tjänster är designade för att minska risken för spridning av dina uppgifter. Informationen som lagras via kakor kan aldrig användas av tredje part i marknadsföringssyfte.'
			},
			{
				title: 'Nödvändiga kakor',
				description:
					'Dessa kakor krävs för att tjänsten ska vara säker och fungera som den ska. Därför går de inte att inaktivera.',
				linkedCategory: 'necessary'
			},
			{
				title: 'Analytiska kakor',
				description:
					'Kakor som ger oss information om hur webbplatsen används som gör att vi kan underhålla, driva och förbättra användarupplevelsen.',
				linkedCategory: 'analytics'
			},
			{
				title: 'Mer information',
				description:
					'Du kan alltid ändra dina val genom att klicka på “Hantera cookies” längst ner på sidan i sidfoten.'
			}
		]
	}
};
