<script lang="ts">
	import BiBook from '~icons/bi/book';
	import BiBox from '~icons/bi/box';
	import BiBoxSeam from '~icons/bi/box-seam';
	import BiBoxes from '~icons/bi/boxes';
	import BiCardImage from '~icons/bi/card-image';
	import BiDatabase from '~icons/bi/database';
	import BiFilm from '~icons/bi/film';
	import BiLaptop from '~icons/bi/laptop';
	import BiMap from '~icons/bi/map';
	import BiMusicNoteBeamed from '~icons/bi/music-note-beamed';
	import BiMusicNoteList from '~icons/bi/music-note-list';
	import BiPeople from '~icons/bi/people';
	import BiPerson from '~icons/bi/person';
	import BiSlashLg from '~icons/bi/slash-lg';
	import BiSoundWave from '~icons/bi/soundwave';
	import BiVectorPen from '~icons/bi/vector-pen';
	import BiTag from '~icons/bi/tag';
	import BiGlobe from '~icons/bi/globe';
	import BiHouseHeart from '~icons/bi/house-heart';
	import BiAlphabet from '~icons/bi/alphabet-uppercase';
	import BiGeoAlt from '~icons/bi/geo-alt';
	import BiClockHistory from '~icons/bi/clock-history';
	import BiBank from '~icons/bi/bank';
	import type { SVGAttributes } from 'svelte/elements';
	import type { Component } from 'svelte';

	type Props = { type: string; class?: string };
	type IconType = Component<SVGAttributes<SVGSVGElement>>;

	const { type, class: className = '' }: Props = $props();

	const ICONS: Record<string, IconType> = {
		Country: BiGeoAlt,
		GenreForm: BiTag,
		Geographic: BiGeoAlt,
		Language: BiGlobe,
		Library: BiHouseHeart,
		Organization: BiBank,
		Person: BiPerson,
		Temporal: BiClockHistory,
		Topic: BiAlphabet,
		Work: BiSlashLg,
		Family: BiPeople,

		// categories / old work types
		Cartography: BiMap,
		Literature: BiBook,
		'Sk%C3%B6nlitteratur': BiBook,
		'Ej%20sk%C3%B6nlitteratur': BiBook,
		MovingImage: BiFilm,
		Music: BiMusicNoteBeamed,
		Object: BiBox,
		Software: BiLaptop,
		StillImage: BiCardImage,

		Audiobook: BiSoundWave,
		'Ljudb%C3%B6cker': BiSoundWave,
		NotatedMusic: BiMusicNoteList,
		Kit: BiBoxSeam,
		Databaser: BiDatabase,

		// Old work types
		Audio: BiSoundWave,
		Dataset: BiDatabase,
		ManuscriptNotatedMusic: BiMusicNoteList,
		ManuscriptText: BiVectorPen,
		MixedMaterial: BiBoxes,
		Multimedia: BiLaptop,

		Text: BiBook,

		// New work types
		Collection: BiBoxes,
		Integrating: BiDatabase

		//Serial: ???,
	};

	const TypeIcon = $derived(ICONS?.[type]);
</script>

{#if TypeIcon}
	<TypeIcon class={className} />
{/if}
