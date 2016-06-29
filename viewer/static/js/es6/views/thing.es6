import View from './view';
import * as thingutil from '../utils/thing';
import * as searchutil from '../utils/search';
import * as VocabLoader from '../utils/vocabloader';
import * as toolbarUtil from '../utils/toolbar';

export default class Thing extends View {

  initialize() {
    super.initialize();

    VocabLoader.initVocabClicks();
    searchutil.initTypeButtons();
    thingutil.createChips($('.main-item'));
    thingutil.createChips($('.side-view'));
    thingutil.initHitlistExpands('.result-list');
    searchutil.initializeSearch();
    toolbarUtil.initToolbar(this);
  }

}
