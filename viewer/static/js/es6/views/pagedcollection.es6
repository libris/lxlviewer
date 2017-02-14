import View from './view';
import * as thingutil from '../utils/thing';
import * as searchutil from '../utils/search';
import * as VocabLoader from '../utils/vocabloader';
import * as toolbarUtil from '../utils/toolbar';

export default class PagedCollection extends View {

  initialize() {
    super.initialize();

    // VocabLoader.initVocabClicks();
    searchutil.initTypeButtons();
    thingutil.initHitlistExpands();
    searchutil.initializeSearch();
    // toolbarUtil.initToolbar(this);
  }
}
