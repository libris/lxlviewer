import View from './view';
import * as thingutil from '../utils/thing';
import * as VocabLoader from '../utils/vocabloader';
import * as toolbarUtil from '../utils/toolbar';

export default class Thing extends View {

  initialize() {
    super.initialize();

    VocabLoader.initVocabClicks();
    thingutil.initializeHoverCards($('.thing-full'), 500);
    toolbarUtil.initToolbar(this);
  }

}
