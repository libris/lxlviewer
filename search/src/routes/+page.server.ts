import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	// Data should probably come from some kind of CMS...
	return {
		featuredSubjects: [
			{
				label: 'Barn- och ungdomsböcker • Magi',
				link: '/search?q=&@type=Work&_limit=40&and-intendedAudience.@id=https://id.kb.se/marc/Juvenile&and-subject.@id=https://id.kb.se/term/barn/Magi'
			},
			{
				label: 'Thrillers • Engelska',
				link: '/search?q=&@type=Work&_limit=40&and-genreForm.@id=https://id.kb.se/term/saogf/Thrillers'
			},
			{
				label: 'Arbetskildringar • Kvinnor',
				link: '/search?q=&@type=Work&_limit=40&and-genreForm.@id=https://id.kb.se/term/saogf/Arbetarskildringar&and-subject.@id=https://id.kb.se/term/sao/Kvinnor'
			},
			{
				label: 'Poesi • Artur Lundkvist',
				link: '/search?q=&@type=Work&_limit=40&and-intendedAudience.@id=https://id.kb.se/marc/Juvenile&and-subject.@id=https://id.kb.se/term/barn/Magi'
			},
			{
				label: 'Bildromaner • Vänskap',
				link: '/search?q=&@type=Work&_limit=40&and-genreForm.@id=https://id.kb.se/term/barngf/Bildromaner&and-subject.@id=https://id.kb.se/term/barn/V%25C3%25A4nskap'
			},
			{
				label: 'Lättläst • Skolan',
				link: '/search?q=&@type=Work&_limit=40&and-genreForm.@id=https://id.kb.se/term/saogf/L%25C3%25A4ttl%25C3%25A4st&and-subject.@id=https://id.kb.se/term/barn/Skolan'
			}
		]
	};
};
