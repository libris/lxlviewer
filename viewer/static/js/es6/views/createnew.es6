import View from './view';
import * as UserUtil from '../utils/user';

export default class CreateNew extends View {

  initialize() {
    super.initialize();

    this.activeForm = '';
    this.transition = false;
    this.initMenu();
  }

  initMenu() {
    self = this;

    function show(id) {
      self.activeForm = id;
      $('#'+id).fadeIn('fast', function() {
        self.transition = false;
      });
    }

    $('.choice').click(function() {
      const id = $(this).attr('data-toggle');
      if (self.activeForm === id || self.transition) return;
      self.transition = true;
      if (self.activeForm) {
        $('#'+self.activeForm).fadeOut('fast', function() {
          show(id);
        });
      } else {
        show(id);
      }
    });
  }
}
