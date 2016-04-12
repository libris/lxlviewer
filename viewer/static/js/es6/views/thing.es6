import View from './view'
import * as thingutil from '../utils/thing'
import * as searchutil from '../utils/search'

export default class Thing extends View {
  
  constructor(name) {
    super(name);
  }
  
  initialize() {
    super.initialize();
    
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
