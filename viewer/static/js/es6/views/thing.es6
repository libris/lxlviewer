import View from './view';
import * as thingutil from '../utils/thing';
import * as VocabLoader from '../utils/vocabloader';
import * as toolbarUtil from '../utils/toolbar';

export default class Thing extends View {

  initialize() {
    super.initialize();
    const postId = window.location.toString().split('#')[0];
    document.title = postId;
    window.location = `${postId}/edit`;
    // VocabLoader.initVocabClicks();
    // thingutil.initializeHoverCards($('.thing-full'), 500);
    // toolbarUtil.initToolbar(this);
  }

}
