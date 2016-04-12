import View from './view'
import * as thingutil from '../utils/thing'
import * as searchutil from '../utils/search'
import * as VocabLoader from '../utils/vocabloader';

export default class Thing extends View {
  
  constructor() {
    super();
  }
  
  initialize() {
    super.initialize();
    
    VocabLoader.initVocabClicks();
    searchutil.initTypeButtons();
    thingutil.createChips($('.main-item'));
    thingutil.createChips($('.side-view'));
    thingutil.initHitlistExpands('.result-list');
    
    // Remove empty fields
    $('form').submit(function(e){
        var emptyinputs = $(this).find('input').filter(function(){
        return !$.trim(this.value).length;
      }).prop('disabled',true);
    });
    
  }
}
