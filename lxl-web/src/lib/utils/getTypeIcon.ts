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

const ICONS: Record<string, ConstructorOfATypedSvelteComponent> = {
	Audio: BiSoundWave,
	Cartography: BiMap,
	Dataset: BiDatabase,
	Family: BiPeople,
	Kit: BiBoxSeam,
	ManuscriptNotatedMusic: BiMusicNoteList,
	ManuscriptText: BiVectorPen,
	MixedMaterial: BiBoxes,
	MovingImage: BiFilm,
	Multimedia: BiLaptop,
	Music: BiMusicNoteBeamed,
	NotatedMusic: BiMusicNoteList,
	Object: BiBox,
	Person: BiPerson,
	StillImage: BiCardImage,
	Text: BiBook,
	Work: BiSlashLg
};

function getTypeIcon(type: string): ConstructorOfATypedSvelteComponent | undefined {
	return ICONS[type];
}

export default getTypeIcon;
